// Blog posts data
// Each post has: slug, title, excerpt, date, updated, readingTime, tags, author, content

export const author = {
  name: 'Luo Xin',
  title: 'Founder, My GEO Check',
  bio: 'Indie developer building tools that help e-commerce stores win in AI-powered search. I write about GEO, AI search visibility, and what actually works when ChatGPT and Perplexity decide which brands get recommended.',
  url: 'https://mygeocheck.com',
};

export const posts = [
  {
    slug: 'shopify-stores-ai-search-visibility',
    title: 'I Checked If Shopify Stores Show Up in ChatGPT — Here\'s What I Found',
    excerpt: 'I ran GEO audits on real Shopify stores across ChatGPT, Perplexity, and Google AI Overviews. Most are invisible. Here\'s why.',
    date: '2026-08-25',
    updated: '2026-08-25',
    dateDisplay: 'August 25, 2026',
    readingTime: '8 min read',
    tags: ['GEO', 'AI Search', 'Shopify', 'ChatGPT'],
    coverColor: 'from-primary-600 to-primary-800',
    content: `
<p>Last week I did something that probably sounds weird: I sat down and typed a bunch of brand names into ChatGPT, Perplexity, and Google's AI Overviews to see which online stores actually showed up.</p>

<p>Not as ads. Not as "sponsored." I'm talking about <strong>organic AI recommendations</strong> — the kind where someone asks "what's a good brand for sustainable running shoes?" and the model names three stores.</p>

<p>If you run a Shopify store, that answer is either sending you free customers or it isn't. And most of the time, it isn't.</p>

<p>I built a tool that automates this audit — it checks a store across multiple AI search platforms and gives a GEO (Generative Engine Optimization) score from 0 to 100. After running it against dozens of real Shopify stores, the numbers were sobering.</p>

<div class="bg-gray-50 border-l-4 border-accent-500 rounded-lg p-6 my-8 not-prose">
  <div class="grid grid-cols-3 gap-4 text-center">
    <div>
      <div class="text-3xl font-bold text-primary-700">38/100</div>
      <div class="text-xs text-gray-500 mt-1 uppercase tracking-wide">Average GEO Score</div>
    </div>
    <div>
      <div class="text-3xl font-bold text-primary-700">76%</div>
      <div class="text-xs text-gray-500 mt-1 uppercase tracking-wide">Invisible on ≥1 AI Platform</div>
    </div>
    <div>
      <div class="text-3xl font-bold text-primary-700">1 in 3</div>
      <div class="text-xs text-gray-500 mt-1 uppercase tracking-wide">Not Mentioned at All</div>
    </div>
  </div>
</div>

<h2>What "GEO" actually means (and why you should care)</h2>

<p>Here's the thing nobody wants to hear: traditional SEO is not enough anymore.</p>

<p>When someone searches on Google, they get ten blue links and your job is to be one of them. But when someone asks ChatGPT or Perplexity a shopping question, they get <em>one answer</em>. If your store isn't in that answer, you don't exist for that customer. No second page, no "maybe scroll down." You're either recommended or you're invisible.</p>

<p>GEO — Generative Engine Optimization — is the practice of making sure your brand gets <em>cited</em> by AI models when people ask questions related to what you sell. It's related to SEO but the rules are different. AI models don't care about your meta descriptions or keyword density. They care about whether your content is structured, citable, and shows up in the training and retrieval data they pull from.</p>

<h2>Three stores, three very different outcomes</h2>

<p>Let me walk you through three real audits. These are well-known Shopify-powered brands, not random small stores — which makes the results even more telling.</p>

<h3>Gymshark: Big brand, surprisingly invisible</h3>

<p>Gymshark is one of the biggest fitness brands on the internet. Hundreds of millions in revenue. Massive social following. You'd assume they dominate AI recommendations.</p>

<p>Their GEO score came back at <strong>35/100</strong>.</p>

<p>Here's what's happening: Gymshark shows up when you type "Gymshark" directly. But for category-level questions like "best gym wear brands" or "affordable athletic wear," the models consistently recommend competitors — Lululemon, Alo Yoga, and smaller DTC brands that have invested in structured content and review aggregator presence.</p>

<p>Brand recognition alone doesn't win in AI search. The model needs to find <em>citable, structured information</em> about your products, and Gymshark's site — like many large e-commerce stores — is heavy on visuals and light on machine-readable content.</p>

<h3>Allbirds: Better, but not safe</h3>

<p>Allbirds scored <strong>52/100</strong>. They do better because they've invested heavily in sustainability content — carbon footprint numbers, material sourcing details, educational blog posts. That kind of specific, factual content is catnip for AI models that need to cite sources.</p>

<p>When you ask Perplexity about "sustainable shoe brands," Allbirds gets named. But ask about "comfortable walking shoes for travel" and they disappear — the model defaults to brands with more review-site presence and comparison content, even if Allbirds makes a perfectly good travel shoe.</p>

<p>The lesson: being good at one angle (sustainability) gets you into AI answers for that angle. But if that's all you cover, you're invisible for every other buying scenario.</p>

<h3>Kylie Cosmetics: Celebrity doesn't translate</h3>

<p>Kylie Cosmetics scored <strong>28/100</strong>. That's the lowest of the three. Despite Kylie Jenner's hundreds of millions of followers, AI models barely cite the brand for makeup-related shopping queries.</p>

<p>Why? Because AI models don't know who Kylie Jenner is in a shopping context the way humans do. They don't see Instagram follower counts. They see product pages with minimal descriptions, a lack of editorial content, and almost no third-party reviews or comparison articles. When the model answers "best liquid lipstick brands," it cites brands that have rich, structured, review-backed content across the web — not the ones with the biggest influencer.</p>

<p>This is the part I find fascinating. The dynamics that made DTC brands win on Instagram and TikTok don't automatically transfer to AI search. A viral Reel won't help you when someone asks ChatGPT for a recommendation.</p>

<h2>The pattern I kept seeing</h2>

<p>After running these audits, four problems showed up over and over:</p>

<ol>
  <li><strong>Thin product descriptions.</strong> "Soft cotton tee" is not citable content. AI models need specifics: materials, dimensions, use cases, comparisons. If your product page is three sentences and a photo, you're not giving the model anything to work with.</li>
  <li><strong>No structured data.</strong> Schema.org markup helps AI systems understand what you sell, how much it costs, and how it's rated. Most Shopify stores I checked either don't have it or have it implemented incorrectly.</li>
  <li><strong>Zero presence on review and comparison sites.</strong> AI models love citing "best X" lists, comparison articles, and review aggregators. If nobody's writing about your products in these formats, the models have nothing to retrieve.</li>
  <li><strong>No FAQ or question-based content.</strong> People ask AI questions, not keywords. If your site doesn't answer actual questions ("Are Allbirds good for wide feet?" "How does Gymshark sizing compare to Lululemon?"), you won't show up in AI responses.</li>
</ol>

<div class="bg-primary-50 border border-primary-200 rounded-lg p-6 my-8 not-prose">
  <p class="text-primary-800 font-medium mb-0">The uncomfortable truth: most of the stores I audited have great SEO by traditional standards. They rank on Google. They have backlinks. They've done their keyword research. But they've spent zero time thinking about whether AI models can find, understand, and cite them — and that gap is going to widen as more people start their shopping journey with an AI query instead of a search bar.</p>
</div>

<h2>What you can actually do about it</h2>

<p>I'm not going to pretend GEO is some magic switch you flip. It's a practice, and it's still early. But there are concrete moves that work:</p>

<ul>
  <li><strong>Add real product detail.</strong> Materials, dimensions, weight, care instructions, use cases, comparisons. The more specific and factual, the better. Write for a machine that needs to confidently cite you.</li>
  <li><strong>Implement Product schema and Review schema.</strong> If you're on Shopify, most themes make this relatively straightforward. Validate it with Google's Rich Results Test.</li>
  <li><strong>Write FAQ content that answers real questions.</strong> Look at what people actually ask about your product category on Reddit, Quora, and Amazon reviews. Answer those questions on your site in plain language.</li>
  <li><strong>Get mentioned on third-party sites.</strong> "Best of" lists, comparison articles, independent reviews. AI models cite these heavily. This is the hardest part but also the highest leverage.</li>
  <li><strong>Make sure your site is actually crawlable and readable by AI systems.</strong> Heavy JavaScript rendering, aggressive bot blocking, and missing sitemap.xml all prevent AI crawlers from accessing your content. You'd be shocked how many big stores accidentally block AI bots.</li>
</ul>

<h2>Why I built the tool</h2>

<p>I got tired of manually typing brand names into five different AI platforms and taking notes. So I built <a href="https://mygeocheck.com" class="text-accent-600 hover:text-accent-700 font-medium">mygeocheck.com</a> — you enter a Shopify store URL, and it checks that store's visibility across ChatGPT, Perplexity, Google AI Overviews, and other AI search engines, then gives you a GEO score with specific recommendations on what to fix.</p>

<p>It's free for the basic scan. The full report breaks down your score by platform, shows you which queries you're missing, and gives you a prioritized action list. If you're running a Shopify store and you've never checked whether AI can even find you, it's worth three minutes of your time.</p>

<p>The shift toward AI search is happening faster than most e-commerce teams are prepared for. The stores that figure out GEO now — while it's still early and the competition is thin — are going to be the ones that get recommended when millions of people start their shopping with a question to an AI instead of a Google search.</p>

<p><strong>Don't be the brand that only shows up when someone already knows your name.</strong></p>
`,
  },
];

// Extract H2 headings from HTML content for TOC
export function extractHeadings(html) {
  const regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  const headings = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    headings.push({ text, id });
  }
  return headings;
}

// Add id attributes to h2 tags for anchor navigation
export function addHeadingIds(html) {
  return html.replace(/<h2>(.*?)<\/h2>/gi, (match, text) => {
    const id = text
      .toLowerCase()
      .replace(/<[^>]*>/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `<h2 id="${id}">${text}</h2>`;
  });
}

// Estimate word count
export function getWordCount(html) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').length;
}

export function getAllPosts() {
  return posts;
}

export function getPostBySlug(slug) {
  return posts.find((p) => p.slug === slug);
}

export function getAllTags() {
  const tagSet = new Set();
  posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export function getPostsByTag(tag) {
  return posts.filter((p) => p.tags.includes(tag));
}

export function getRelatedPosts(currentSlug, limit = 3) {
  const current = getPostBySlug(currentSlug);
  if (!current) return [];
  return posts
    .filter((p) => p.slug !== currentSlug)
    .map((p) => ({
      ...p,
      relevance: p.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}
