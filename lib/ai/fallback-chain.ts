import type {
  CandidateCode,
  ClassificationResult,
  ProductInput,
} from "@/types";
import type { AIProvider, ProductLookupResult } from "./types";
import { MockAIProvider } from "./mock-provider";
import { findCuratedProduct } from "./curated-products";

/**
 * FallbackChainProvider — tries each provider in order (primary first, then
 * free-tier fallbacks like Groq/OpenRouter/Cerebras) and only drops to the
 * deterministic offline engine when every live provider has failed. This is
 * the ONLY place that decides degradation, and it is never silent: results
 * served by anything other than the primary carry a service notice
 * (classification) or degraded reason (Quick Find) that the UI shows.
 *
 * Providers in the chain are expected to THROW on failure. The primary
 * providers' internal retry-without-search is fine (same provider, reduced
 * tooling); what they must not do is swallow a total failure.
 */
export class FallbackChainProvider implements AIProvider {
  readonly name: string;
  private providers: AIProvider[];
  private mock = new MockAIProvider();

  constructor(providers: AIProvider[]) {
    if (providers.length === 0) throw new Error("FallbackChainProvider needs at least one provider");
    this.providers = providers;
    // The pipeline records provider name once up front; the actually-serving
    // provider is surfaced per-result via service_notice / degraded_reason.
    this.name = providers[0].name;
  }

  private notice(servedBy: string): string {
    const primary = this.providers[0].name;
    return `Live AI service notice: ${primary} was unavailable (rate limit, quota, or outage), so this result was produced by ${servedBy}${servedBy === "the offline engine" ? "" : " without web-search verification"}. Quality may be slightly reduced; quotas usually reset within minutes to a day.`;
  }

  async classifyProduct(
    input: ProductInput,
    candidates: CandidateCode[],
  ): Promise<ClassificationResult> {
    for (let i = 0; i < this.providers.length; i++) {
      try {
        const result = await this.providers[i].classifyProduct(input, candidates);
        if (i > 0) result.service_notice = this.notice(this.providers[i].name);
        return result;
      } catch (err) {
        console.error(
          `[ai-chain] classifyProduct via ${this.providers[i].name} failed${i + 1 < this.providers.length ? ", trying next" : ""}:`,
          err,
        );
      }
    }
    const result = await this.mock.classifyProduct(input, candidates);
    result.service_notice = this.notice("the offline engine");
    return result;
  }

  async lookupProduct(query: string): Promise<ProductLookupResult> {
    // Curated hits are free and identical everywhere — never burn quota on them.
    const curated = findCuratedProduct(query);
    if (curated) return curated;

    for (let i = 0; i < this.providers.length; i++) {
      try {
        const result = await this.providers[i].lookupProduct(query);
        // A clean "not found" from a live provider is a real answer — don't
        // cascade further and burn the remaining quotas on it.
        if (i > 0) {
          result.degraded_reason = this.notice(this.providers[i].name);
        }
        return result;
      } catch (err) {
        console.error(
          `[ai-chain] lookupProduct via ${this.providers[i].name} failed${i + 1 < this.providers.length ? ", trying next" : ""}:`,
          err,
        );
      }
    }
    const offline = await this.mock.lookupProduct(query);
    return { ...offline, degraded_reason: this.notice("the offline engine") };
  }

  async generateMissingInfoQuestions(input: ProductInput): Promise<string[]> {
    for (const provider of this.providers) {
      try {
        return await provider.generateMissingInfoQuestions(input);
      } catch {
        // fall through
      }
    }
    return this.mock.generateMissingInfoQuestions(input);
  }

  async generateBrokerReport(
    input: ProductInput,
    result: ClassificationResult,
  ): Promise<string> {
    // Deterministic everywhere for a consistent broker format.
    return this.mock.generateBrokerReport(input, result);
  }
}
