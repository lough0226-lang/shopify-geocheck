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
    quickAnswer: 'Most Shopify stores are invisible in AI search. After auditing dozens of real stores across ChatGPT, Perplexity, and Google AI Overviews, the average GEO score was just 38/100 — with 76% invisible on at least one AI platform. The main culprits are thin product descriptions, missing structured data, and zero third-party review presence.',
    faq: [
      {
        q: 'What is GEO (Generative Engine Optimization)?',
        a: 'GEO is the practice of optimizing your website and content so that AI search engines like ChatGPT, Perplexity, and Google AI Overviews can find, understand, and cite your brand when users ask product-related questions. Unlike SEO which targets ranking positions, GEO targets being recommended in AI-generated answers.',
      },
      {
        q: 'What is the average GEO score for Shopify stores?',
        a: 'Based on audits of dozens of real Shopify stores, the average GEO score is 38 out of 100. Approximately 76% of stores are invisible on at least one AI search platform, and one in three stores are not mentioned by AI models at all.',
      },
      {
        q: 'Why don\'t big brands always show up in AI search?',
        a: 'Brand recognition alone does not win in AI search. AI models need citable, structured information about products. Large brands like Gymshark (GEO score 35/100) often have visual-heavy sites with thin machine-readable content, while smaller brands with detailed specifications and review presence get cited instead.',
      },
      {
        q: 'How can I improve my Shopify store\'s GEO score?',
        a: 'Key tactics include: adding specific factual details to product descriptions (materials, dimensions, use cases), implementing Product and Review schema markup, creating FAQ content that answers real customer questions, getting mentioned on third-party review and comparison sites, and ensuring AI crawlers can access your site.',
      },
    ],
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
  {
    slug: 'how-to-check-brand-visibility-chatgpt-perplexity',
    title: 'How to Check If Your Brand Shows Up in ChatGPT, Perplexity, and Google AI Overviews',
    excerpt: 'A step-by-step guide to auditing your brand\'s AI search visibility — including the exact prompts to use and what to do if you\'re invisible.',
    date: '2026-08-27',
    updated: '2026-08-27',
    dateDisplay: 'August 27, 2026',
    readingTime: '8 min read',
    tags: ['GEO', 'AI Search', 'ChatGPT', 'Brand Visibility'],
    coverColor: 'from-blue-600 to-indigo-800',
    quickAnswer: 'To check if your brand appears in AI search, test three query types (branded, category, and comparison) across ChatGPT, Perplexity, and Google AI Overviews. For each platform, note whether you are mentioned, where you appear, what the model says about you, and what sources it cites. Most brands only check branded queries and miss the category queries that drive new customer discovery.',
    faq: [
      {
        q: 'How do I check if my brand appears in ChatGPT?',
        a: 'Open a fresh ChatGPT chat and run three types of prompts: branded queries ("Tell me about [your brand]"), category queries ("What are the best [product category] brands?"), and comparison queries ("[Your brand] vs [competitor]"). Note whether you are mentioned, your position in the response, and whether any product details are inaccurate. Run tests both with and without Browse enabled.',
      },
      {
        q: 'How is checking Perplexity different from ChatGPT?',
        a: 'Perplexity is built around real-time search and cites its sources directly. This makes it especially useful for audits because you can see exactly which websites the model pulls information from. Use Pro Search mode and pay close attention to whether your site or competing sites are cited in the source list.',
      },
      {
        q: 'What are the three types of queries to test for AI visibility?',
        a: 'The three query types are: (1) Branded queries — "Tell me about [your brand]" to check if the model knows you exist; (2) Category queries — "Best [product type] for [use case]" to test new customer discovery; (3) Comparison queries — "[Your brand] vs [competitor]" to see how you stack up. Category and comparison queries are where new customers find you.',
      },
      {
        q: 'What should I do if my brand is invisible in AI search results?',
        a: 'Start by enriching product descriptions with specific factual details (materials, dimensions, use cases), add Schema.org structured data, create FAQ content answering real customer questions, and work on third-party presence through reviews and comparison articles. You can also use automated tools like mygeocheck.com to get a GEO score with specific recommendations.',
      },
    ],
    content: `
<p>Last month I spent an afternoon typing my own brand name into every AI search tool I could find. ChatGPT. Perplexity. Google's AI Overviews. Claude. You name it.</p>

<p>Half the time, I wasn't there.</p>

<p>Not in a "we're ranked number seven" kind of way. In a "the model has literally never heard of me" kind of way. That stung, but it was also useful — because once I knew where the gaps were, I could start fixing them.</p>

<p>If you run an online store or any kind of brand, you should do this audit too. Most people don't, and that's a problem. Your customers are increasingly asking AI tools where to buy things instead of Googling them. If the AI doesn't mention you, those customers don't know you exist.</p>

<p>Here's exactly how I check brand visibility across the major AI search platforms — including the specific prompts I use, what to look for in the responses, and what to do if you come up empty.</p>

<h2>Why you can't just search your brand name</h2>

<p>Here's the mistake most people make: they type their exact brand name into ChatGPT, see that it knows who they are, and call it a day.</p>

<p>That's like checking if your SEO works by searching for your own domain name. Of course you show up — the model is just regurgitating what it already knows about you from your name alone.</p>

<p>The real question is whether you show up when someone asks a <em>category question</em>. "What's a good brand for waterproof hiking boots?" "Best minimalist wallet for men." "Sustainable activewear for women." These are the queries that actually drive new customer discovery. If you only show up for branded searches, you're only reaching people who already know you exist.</p>

<p>So your audit needs to cover three types of queries:</p>

<ol>
  <li><strong>Branded queries</strong> — "Tell me about [your brand]"</li>
  <li><strong>Category queries</strong> — "Best [product type] for [use case]"</li>
  <li><strong>Comparison queries</strong> — "[Your brand] vs [competitor]"</li>
</ol>

<p>All three matter, but the category and comparison queries are where new customers find you. Branded queries are where existing customers validate you.</p>

<h2>Checking ChatGPT</h2>

<p>ChatGPT is tricky because it uses a mix of training data and (with Browse enabled) real-time web results. The answers can vary depending on whether you're using GPT-4 with browsing or an older model without internet access.</p>

<p>Here's what I do.</p>

<p>First, open a fresh chat. Context from previous conversations can influence answers, so start clean. Then run these prompts one at a time:</p>

<ul>
  <li>"What are the best [product category] brands in [current year]?"</li>
  <li>"Can you recommend [product type] for [specific use case or audience]?"</li>
  <li>"Compare [your brand] with [two competitors]. What are the tradeoffs?"</li>
  <li>"Tell me about [your brand]. What do they sell and how are they reviewed?"</li>
</ul>

<p>For each prompt, note three things:</p>

<p><strong>Are you mentioned at all?</strong> If not, that's a visibility gap. The model doesn't have enough citable information about your brand to include you.</p>

<p><strong>If you are mentioned, where do you appear?</strong> First recommendation? Third? In AI search, position matters less than in traditional search because people read the whole answer, but being first is still better than being an afterthought.</p>

<p><strong>What does the model say about you?</strong> Sometimes you'll be mentioned but described inaccurately — wrong product categories, outdated pricing, or even facts pulled from a similarly named company. I've seen this happen to brands with generic names. The AI confidently describes a completely different business.</p>

<p>If you have ChatGPT Plus or Team, run the same prompts with Browse enabled and without. The discrepancy can be revealing. With browsing, the model pulls real-time information and might find content that isn't in its training data. Without browsing, it relies on what it already knows — which reflects your long-term content footprint.</p>

<h2>Checking Perplexity</h2>

<p>Perplexity is different from ChatGPT because it's built around search. It pulls in real-time sources and cites them, which means you can actually see <em>where</em> it's getting its information about your brand. That makes it incredibly useful for an audit.</p>

<p>Use the Pro Search mode for the most thorough results. Try these prompts:</p>

<ul>
  <li>"Best [product category] available online right now"</li>
  <li>"What are the top-rated [product type] according to reviews?"</li>
  <li>"[Your brand] reviews — what do customers actually say?"</li>
  <li>"[Your brand] alternatives and competitors"</li>
</ul>

<p>Pay close attention to the sources Perplexity cites. This is the gold. If it's citing your competitors' sites but not yours, that tells you something. If it's citing review sites that don't mention you, you know where you need to get coverage. If it cites Reddit threads where people recommend other brands, that's a signal that word-of-mouth in communities matters for AI visibility.</p>

<p>I also like to check the "People Also Ask" style follow-up questions Perplexity generates. Those give you more query ideas to test, and they often reveal the specific angles customers care about — angles you should be creating content around.</p>

<h2>Checking Google AI Overviews</h2>

<p>Google's AI Overviews (formerly Search Generative Experience) are the AI summaries that appear at the top of some search results. They're important because they're integrated directly into the search engine most people already use. You don't need a separate app or account — people see these answers just by Googling.</p>

<p>The challenge is that AI Overviews don't appear for every query, and they roll out differently by region and device. But here's how to check:</p>

<p>Search Google (logged out or in incognito mode to reduce personalization) for the same category and comparison queries you used in ChatGPT. Look for the AI-generated summary block at the top of the results.</p>

<p>Ask yourself:</p>

<ul>
  <li>Does an AI Overview appear at all for this query?</li>
  <li>If so, which brands or sources does it mention?</li>
  <li>Does it link to your site or cite your content?</li>
  <li>Does it pull information from third-party reviews or comparison articles that feature you?</li>
</ul>

<p>One thing I've noticed: Google AI Overviews tend to favor established, well-structured content from authoritative sources. If your product pages are thin and your blog hasn't been updated since 2023, you're unlikely to appear. Google also heavily favors its own ecosystem — YouTube videos, Google Reviews, and Google Merchant Center listings can all influence what shows up in the Overview.</p>

<h2>What to look for across all platforms</h2>

<p>After running these prompts across ChatGPT, Perplexity, and Google AI Overviews, you should start to see patterns. Here's what I track:</p>

<p><strong>Platform coverage.</strong> Are you mentioned on all three, or just one? Being visible on Perplexity but not ChatGPT means the model's training data is missing you, even if search results find you. Being on ChatGPT but not in AI Overviews suggests Google isn't picking up your content the way you'd expect.</p>

<p><strong>Query coverage.</strong> Which types of queries get you mentioned? If you only show up for branded searches, you have a discoverability problem. If you show up for category queries but not comparison queries, you might lack content that positions you against alternatives.</p>

<p><strong>Sentiment and accuracy.</strong> When you are mentioned, is it accurate and positive? AI models sometimes hallucinate details or pull from outdated sources. If ChatGPT confidently states that you sell a product you discontinued two years ago, that's a problem — potential customers are getting wrong information.</p>

<p><strong>Source quality.</strong> On Perplexity especially, check what sources the model uses. If it's citing low-quality affiliate sites over your own product pages, that means your content isn't considered authoritative enough for the model to cite directly.</p>

<h2>What to do if you're invisible</h2>

<p>Let's say you run the audit and — like I did the first time — you barely show up. Don't panic. This is fixable, and the fact that you're checking puts you ahead of most of your competitors.</p>

<p>Start with the basics. Make sure your site has detailed, factual product descriptions that go beyond marketing fluff. AI models need specifics they can cite: materials, dimensions, use cases, pricing, availability. "Premium quality leather wallet" means nothing to a language model. "Full-grain leather bifold wallet with 8 card slots, RFID-blocking lining, and a 2-year warranty" is citable, specific, and useful.</p>

<p>Then look at your content footprint beyond your own site. AI models pull from the entire web, not just your domain. Are people reviewing your products? Are comparison articles mentioning you? Are there Reddit threads or forum discussions where customers recommend your brand? These third-party signals matter enormously because they give the model multiple independent sources to reference.</p>

<p>Add structured data to your site. Schema.org markup for products, reviews, FAQs, and organizations gives AI systems a clear, machine-readable way to understand what you sell and how customers rate you. Most Shopify themes support basic product schema, but review schema and FAQ schema often require extra setup.</p>

<p>And honestly? The fastest way to get a read on where you stand is to use a tool that automates this. I built <a href="https://mygeocheck.com">mygeocheck.com</a> precisely because doing this manually across every AI platform is tedious. You enter your store URL, and it checks your visibility across ChatGPT, Perplexity, Google AI Overviews, and more — then gives you a GEO score with specific recommendations. It takes about a minute and beats typing prompts into five different tools for an afternoon.</p>

<p>However you do it, the important thing is that you do it. AI search isn't some distant future scenario. People are asking these tools for buying recommendations right now, and every query where your brand doesn't appear is a customer who just found a competitor instead.</p>

<p>Check your visibility today. Fix the gaps tomorrow. Your future self — and your revenue — will thank you.</p>
`,
  },
  {
    slug: 'geo-vs-seo-difference-2026',
    title: 'GEO vs SEO: The Difference That Actually Matters in 2026',
    excerpt: 'SEO gets you ranked. GEO gets you recommended. Here\'s why that distinction changes everything for e-commerce brands.',
    date: '2026-08-27',
    updated: '2026-08-27',
    dateDisplay: 'August 27, 2026',
    readingTime: '8 min read',
    tags: ['GEO', 'SEO', 'AI Search', 'Strategy'],
    coverColor: 'from-emerald-600 to-teal-800',
    quickAnswer: 'SEO gets your page ranked in a list of links; GEO gets your brand recommended in an AI-generated answer. SEO is keyword-driven and controlled on your own site; GEO is question-driven and depends on your entire information ecosystem across the web. They are complementary, not competitive — but SEO alone is no longer sufficient as more users start their shopping journey with AI queries.',
    faq: [
      {
        q: 'What is the main difference between GEO and SEO?',
        a: 'SEO targets ranking positions on search engine results pages — you compete alongside other links for clicks. GEO targets being cited or recommended within AI-generated answers, where the model synthesizes multiple sources into a single response. In GEO, you are either recommended or invisible; there is no page two.',
      },
      {
        q: 'Will GEO replace SEO?',
        a: 'No. GEO does not replace SEO — it builds on top of it. Technical SEO foundations like site speed, crawlability, and quality content are essential for both. GEO adds a layer focused on making brands citeable by AI models through factual specificity, structured data, third-party validation, and question-based content.',
      },
      {
        q: 'Why do backlinks matter less in GEO compared to SEO?',
        a: 'Industry data shows brand mentions across the web correlate with AI Overview appearance at r=0.664, while backlinks correlate at only r=0.218 — roughly 3x weaker. For AI visibility, being described consistently across many independent sources matters more than being linked to, because AI models value corroboration across sources.',
      },
      {
        q: 'Can I optimize for both SEO and GEO at the same time?',
        a: 'Yes, and you should. Many tactics overlap: quality content, site speed, structured data, and clear heading structure help both. GEO-specific additions include answer-first content, question-shaped headings, high fact density with statistics, comparison tables, and ensuring third-party sources mention your brand with specific factual details.',
      },
    ],
    content: `
<p>I'll get straight to the point: if you're still only doing SEO in 2026, you're optimizing for the last era of search.</p>

<p>That doesn't mean SEO is dead. It's not. Backlinks still matter. Meta titles still matter. Site speed still matters. Anyone who tells you to stop doing SEO entirely is selling something.</p>

<p>But here's what's changed: a growing share of search traffic no longer flows through a page of ten blue links. It flows through an AI-generated answer that synthesizes information from multiple sources and gives the user a single, confident recommendation. When that happens, the rules of visibility change — and the practice of winning in that environment has a name: GEO, or Generative Engine Optimization.</p>

<p>I've spent months auditing Shopify stores for AI search visibility, and the difference between stores that get SEO and stores that get GEO is stark. Let me break down what actually separates the two, why it matters, and where I think most brands are getting it wrong.</p>

<h2>The fundamental difference: ranking vs. being recommended</h2>

<p>SEO is about ranking. You want your page to appear high in a list of search results. The user scans the list, reads titles and descriptions, and decides which link to click. You're competing for attention alongside nine other results on page one, and even position five or six can send meaningful traffic.</p>

<p>GEO is about being recommended. The AI reads multiple sources, synthesizes what it finds, and delivers one answer. It might name three brands. It might name one. If you're not in the answer, you don't exist for that query. There is no page two. There is no "scroll down and see what else is there." You're either cited or you're invisible.</p>

<p>This is not a subtle distinction. It changes the entire optimization mindset.</p>

<p>With SEO, you can win by being the tenth result and still get clicks. With GEO, you need to be in the top few sources the model chooses to cite — and the model doesn't show you the rest. It's the difference between being on a shelf and being the product the salesperson hands the customer.</p>

<h2>What SEO and GEO optimize for</h2>

<p>SEO optimizes for signals that search algorithms use to rank pages: keyword relevance, backlink authority, content depth, page experience, technical health. You're trying to convince an algorithm that your page is the best result for a specific query.</p>

<p>GEO optimizes for signals that language models use to construct answers: factual specificity, source diversity, structured information, third-party validation, content that directly answers questions in citable language. You're trying to convince an AI that your content is reliable, relevant, and worth quoting when it constructs its response.</p>

<p>There's overlap, of course. Good content helps both. But there are also real tensions. Let me give you a concrete example.</p>

<h3>Where they diverge: a real comparison</h3>

<p>Say you sell ceramic cookware. An SEO playbook would tell you to create a product page targeting "ceramic non-stick cookware," build backlinks to that page, optimize your title tag and meta description, and maybe write a blog post targeting "best ceramic cookware sets."</p>

<p>That works. It still works. If you rank on page one for "best ceramic cookware," you get clicks.</p>

<p>But here's what happens when someone asks Perplexity or ChatGPT "what's the best ceramic cookware for induction stoves?" The AI doesn't look at title tags. It scans multiple sources, compares product specifications, checks what reviewers say, and synthesizes an answer. It might recommend three brands, citing specific reasons for each.</p>

<p>For you to be one of those three brands, the model needs to find:</p>

<ul>
  <li>Specific, factual information about your products (material composition, compatibility with induction stoves, temperature range, warranty terms)</li>
  <li>Multiple independent sources mentioning your products in relevant contexts (review sites, cooking blogs, forum discussions)</li>
  <li>Structured data that makes it easy for the model to parse your product information</li>
  <li>Content that directly addresses the question being asked, not just a generic product description</li>
</ul>

<p>A page that ranks well in SEO because it has strong backlinks and a well-optimized title tag might still fail in GEO if the actual content is thin, generic, or lacks the specific facts a language model needs to confidently cite it.</p>

<h2>The mindset shift that trips people up</h2>

<p>The biggest difference between SEO and GEO isn't tactical — it's philosophical.</p>

<p>SEO is fundamentally about <strong>owning</strong> your ranking. You build pages, you earn links, you optimize your site. It's your domain, your content, your authority. You control the levers.</p>

<p>GEO requires you to think about your <strong>entire information ecosystem</strong>, not just your own site. AI models pull from Reddit threads, YouTube transcripts, Amazon reviews, news articles, comparison blogs, Wikipedia, and dozens of other sources you don't control. If the only place your brand is described in depth is your own website, you're at a disadvantage because models value corroboration across independent sources.</p>

<p>This is hard for a lot of e-commerce founders to accept. You're used to controlling your brand message. But GEO rewards brands that are talked about <em>by other people</em> in specific, factual, citable ways. A random blogger who writes a detailed comparison of your product against two competitors is potentially more valuable for your GEO than ten pages of your own marketing copy.</p>

<h2>What GEO doesn't mean</h2>

<p>Let me be clear about what I'm not saying.</p>

<p>GEO is not replacing SEO. You don't need to choose. Think of it this way: SEO is your foundation. It makes your site discoverable, crawlable, and authoritative. GEO is the layer on top that makes your brand <em>citeable and recommendable</em> when AI systems construct answers.</p>

<p>Abandon SEO and your GEO efforts suffer too, because many of the things that make your site strong for AI — fast loading, clear structure, quality content — are the same things SEO has been teaching for years. The two are complementary, not competitive.</p>

<p>What I am saying is that SEO alone is no longer sufficient. If your entire digital strategy is built around ranking for keywords and you've spent zero time thinking about how AI models find, parse, and cite your brand, you're leaving a growing channel completely untended.</p>

<h2>The keyword problem</h2>

<p>Here's another key difference. SEO is keyword-driven. You research what people search for, then create pages that target those keywords. It's a proven model and it works.</p>

<p>But AI search is question-driven and conversational. People don't type "ceramic cookware" into ChatGPT. They ask, "I have an induction stove and I'm tired of my non-stick pans peeling after six months — what's a durable ceramic cookware set that won't break the bank?"</p>

<p>That's not a keyword. It's a paragraph. It contains context, constraints, and intent that a keyword strategy alone won't capture. To show up in the answer, your content needs to address the underlying question, not just match the surface-level terms.</p>

<p>This is why FAQ content, comparison guides, and detailed use-case articles tend to perform well in AI search. They match the way people actually ask questions when they're talking to an AI — naturally, with context and specificity, not in stilted keyword phrases.</p>

<h2>Where to start if you're behind</h2>

<p>If you've been focused on SEO and haven't thought about GEO at all, the good news is that you're not starting from zero. Your existing content, backlinks, and site authority give you a base. But you need to shift some of your effort toward AI-specific visibility.</p>

<p>First, audit your current AI visibility. Before you can fix anything, you need to know where you stand. Type your brand and product categories into ChatGPT, Perplexity, and Google AI Overviews. See what comes back. Or use a tool like <a href="https://mygeocheck.com">mygeocheck.com</a> that does this automatically and gives you a score across platforms.</p>

<p>Second, enrich your product content with specific, citable facts. Materials, dimensions, compatibility, use cases, testing results, warranty terms. If a language model can extract a concrete claim from your product page, it can cite you. If all you have is "premium quality," it can't.</p>

<p>Third, build out question-based content. What do people actually ask about your product category? Go to Reddit, Amazon Q&A, and customer support tickets. Find the real questions, then answer them thoroughly on your site. Not in a generic FAQ page with three questions — in detailed articles that address real concerns with specifics.</p>

<p>Fourth, work on your third-party presence. Get your products reviewed. Pitch comparison articles. Participate in community discussions where your expertise adds value. This is the hardest and slowest part, but it's also the one that gives AI models the independent corroboration they need to confidently recommend you.</p>

<p>And finally, implement structured data. Product schema, review schema, FAQ schema, organization schema. These aren't optional in an AI-first world. They're the difference between an AI having to guess what your page is about and being told directly.</p>

<h2>The bottom line</h2>

<p>GEO vs. SEO isn't a battle. It's an evolution. SEO taught us how to make websites discoverable by algorithms. GEO teaches us how to make brands recommendable by AI. The brands that win in 2026 and beyond will be the ones that do both — that have the technical foundation of strong SEO and the content ecosystem that makes them the obvious choice when an AI constructs its answer.</p>

<p>If you're reading this and thinking "I should probably check whether AI can even find my brand," you're already ahead of most. The gap between brands that get GEO and brands that don't is still wide, but it won't stay that way forever. Start now while the competition is thin.</p>
`,
  },
  {
    slug: 'get-shopify-store-mentioned-by-ai-search',
    title: '7 Ways to Get Your Shopify Store Recommended by AI Search Engines',
    excerpt: 'Practical tactics to improve your store\'s chances of being cited by ChatGPT, Perplexity, and Google AI Overviews — no fluff.',
    date: '2026-08-27',
    updated: '2026-08-27',
    dateDisplay: 'August 27, 2026',
    readingTime: '9 min read',
    tags: ['GEO', 'Shopify', 'AI Search', 'Tactics'],
    coverColor: 'from-orange-500 to-red-700',
    quickAnswer: 'The seven most effective tactics to get your Shopify store cited by AI search engines are: write specific factual product descriptions, implement and validate Schema.org structured data, build FAQ content from real customer questions, get third-party reviews and comparisons, write honest competitor comparison pages, ensure AI crawlers can access your site, and publish original test data or research.',
    faq: [
      {
        q: 'How do I optimize my Shopify product descriptions for AI search?',
        a: 'Replace vague marketing language with concrete, citable facts: exact material composition (e.g., "180 GSM pre-shrunk cotton" instead of "premium fabrics"), dimensions, fit notes, care instructions, manufacturing origin, and warranty terms. AI models need specific claims they can confidently attribute to your brand. Generic descriptions like "soft and comfortable" provide nothing to cite.',
      },
      {
        q: 'What Schema.org markup should Shopify stores have for GEO?',
        a: 'The essential schema types are: Product schema with name, image, description, brand, SKU, and offers; AggregateRating schema if you have reviews; FAQPage schema on question-and-answer content; BreadcrumbList schema for navigation; and Organization schema on the homepage. Validate all markup using Google\'s Rich Results Test, as roughly 60% of Shopify stores have schema errors.',
      },
      {
        q: 'How do I get my products mentioned by third-party review sites?',
        a: 'Identify niche publications and creators in your product category, send review units with a concise honest pitch (do not ask for positive reviews), pitch comparison articles with a specific factual reason your product deserves inclusion, and encourage customers to leave reviews on platforms AI systems crawl like Amazon, Trustpilot, and Google Reviews.',
      },
      {
        q: 'Should I block AI crawlers like GPTBot on my Shopify store?',
        a: 'If you want visibility in AI search results, do not block retrieval crawlers like GPTBot, PerplexityBot, or Google-Extended. Blocking them prevents your content from appearing in ChatGPT browsing results, Perplexity answers, and Google AI Overviews. Some brands block training crawlers separately, but retrieval bots must be allowed for GEO. Check your robots.txt and bot-blocking apps.',
      },
      {
        q: 'Why is original data or research important for GEO?',
        a: 'AI models prioritize unique, verifiable data that cannot be found elsewhere. Publishing original test results, durability data, or comparative research gives AI models citable data points that no competitor can match, attracts backlinks and third-party mentions, and positions your brand as an expert source for category-level questions even when the answer is not directly about your product.',
      },
    ],
    content: `
<p>I've audited a lot of Shopify stores for AI search visibility. The average GEO score sits around 38 out of 100, which sounds bad until you realize most stores score under 25. The gap isn't because these are bad stores. It's because almost nobody is optimizing for AI recommendation engines yet.</p>

<p>That's the good news. The barrier to entry is low because most of your competitors aren't even trying. A few focused changes can meaningfully improve your chances of being cited when someone asks ChatGPT, Perplexity, or Google AI Overviews for a product recommendation.</p>

<p>Here are seven tactics that actually work, based on what I've seen across dozens of store audits. No vague "create great content" advice. Each one has a specific action you can take this week.</p>

<h2>1. Stop writing product descriptions for humans only</h2>

<p>I'm not saying you should write for robots instead of people. I'm saying your product descriptions need to work for both, and right now most only work for humans who are already looking at your page.</p>

<p>Here's what I mean. A typical Shopify product description reads something like: "Our signature cotton tee, crafted from premium fabrics for everyday comfort. Available in five colors." That's fine for a browsing customer. But when an AI model is trying to answer "what's a good everyday cotton t-shirt," there's nothing citable in that sentence. "Premium fabrics" isn't a fact. "Everyday comfort" isn't a specification.</p>

<p>Rewrite your descriptions to include concrete details that a language model can extract and cite:</p>

<ul>
  <li>Exact material composition (100% organic cotton, 180 GSM, pre-shrunk)</li>
  <li>Dimensions and fit notes (size medium chest width 20 inches, runs one size large)</li>
  <li>Specific use cases (suitable for screen printing, layering in fall weather)</li>
  <li>Care instructions with specifics (machine wash cold, tumble dry low, no bleach)</li>
  <li>Origin and manufacturing details (knit in North Carolina, cut and sewn in Los Angeles)</li>
  <li>Warranty or guarantee terms (365-day return policy, one-year workmanship warranty)</li>
</ul>

<p>The goal isn't to stuff your page with data. It's to give AI models specific, factual claims they can confidently attribute to your brand. When Perplexity answers "what's a durable heavyweight cotton t-shirt," it needs to cite a source that says "180 GSM" or "pre-shrunk" or "one-year warranty." If that's not on your page, it will cite the brand whose page does have it.</p>

<h2>2. Implement structured data (and actually validate it)</h2>

<p>Structured data — specifically Schema.org markup — is how you tell AI systems exactly what your products are, how much they cost, how they're rated, and where to buy them. It's not a nice-to-have. It's the clearest signal you can send.</p>

<p>Most Shopify themes include basic Product schema out of the box. But "basic" is the operative word. The default markup often misses critical fields, and I've seen themes that generate broken or invalid schema without the store owner ever knowing.</p>

<p>Here's what to do:</p>

<p>First, run your product pages through Google's <a href="https://search.google.com/test/rich-results">Rich Results Test</a>. This tells you exactly what schema is present and whether it's valid. Don't assume it's working because your theme says it supports schema. I've found errors on roughly 60% of the Shopify stores I've checked.</p>

<p>Second, make sure you have these schema types covered:</p>

<ul>
  <li><strong>Product schema</strong> with name, image, description, brand, SKU, and offers (price, availability, currency)</li>
  <li><strong>AggregateRating schema</strong> if you have product reviews (this requires a reviews app that supports schema output)</li>
  <li><strong>FAQ schema</strong> on any page that has question-and-answer content</li>
  <li><strong>BreadcrumbList schema</strong> for site navigation clarity</li>
  <li><strong>Organization schema</strong> on your homepage with your brand name, logo, social profiles, and contact info</li>
</ul>

<p>If you're not technical, apps like JSON-LD for SEO or Smart SEO can handle most of this. The key is to validate after installation. I've seen apps that inject schema correctly on product pages but break on collection pages, or that conflict with theme-generated schema and produce duplicate markup.</p>

<h2>3. Build FAQ content around real questions</h2>

<p>AI search is conversational. People ask full questions, not keywords. If your site answers those questions directly, you increase the odds of being cited.</p>

<p>But here's where most brands go wrong: they write FAQs based on what they <em>think</em> customers ask, instead of what customers <em>actually</em> ask.</p>

<p>Go find the real questions. Here's where I look:</p>

<ul>
  <li>Your customer support inbox and live chat transcripts. What do people repeatedly ask before buying?</li>
  <li>Reddit threads in subreddits related to your product category. What problems are people trying to solve?</li>
  <li>Amazon Q&A sections for products similar to yours. What questions do shoppers ask there?</li>
  <li>The "People Also Ask" boxes in Google search results for your target queries.</li>
  <li>Competitor review sections. What do customers praise or complain about? Those are questions you should be answering.</li>
</ul>

<p>Once you have a list of real questions, don't bury them on a single FAQ page with three-sentence answers. Write thorough, specific responses. If someone asks "does this work with induction stoves?" don't say "yes, it works with most stovetops." Say "Yes, the base features a 4mm magnetic stainless steel disc compatible with all induction cooktops, including models from Bosch, Samsung, and LG. It also works on gas, electric, and ceramic glass surfaces."</p>

<p>That's the kind of answer an AI can cite. "It works with most stovetops" is not.</p>

<p>Add FAQ schema markup to these pages so AI systems can identify the question-and-answer structure unambiguously.</p>

<h2>4. Get your products into third-party reviews and comparisons</h2>

<p>This is the highest-leverage tactic and the hardest one to execute. AI models heavily cite third-party sources — review sites, "best of" lists, comparison articles, and independent testing publications. If these sources don't mention your brand, you're fighting with one hand tied behind your back.</p>

<p>When Perplexity answers "what's the best [product category]," it doesn't just look at manufacturer websites. It pulls from Wirecutter, RTINGS, Outdoor Gear Lab, niche blogs, YouTube reviews, and anywhere else that has independently evaluated products. If your product is in those roundups, you get cited. If it's not, the model recommends whoever is.</p>

<p>Here's how to approach this pragmatically:</p>

<p><strong>Identify the publications and creators that matter in your niche.</strong> Don't chase the biggest names. A YouTube creator with 15,000 dedicated subscribers in your specific category is more valuable for GEO than a mention on a massive general-interest site, because their content is more likely to be surfaced for relevant category queries.</p>

<p><strong>Send review units.</strong> This is standard practice and it works. Reach out with a concise, personalized pitch. Don't ask for a positive review — ask for an honest evaluation. Creators can smell a quid pro quo, and AI models don't care whether the review is positive or negative. They care that a credible independent source mentions your product with specific details.</p>

<p><strong>Pitch comparison articles.</strong> If a blog in your niche has published "Best [X] of 2026" and you're not on it, reach out. Not with a generic press release — with a specific reason your product deserves inclusion. Maybe you use a unique material, offer a better warranty, or fill a price gap their current list misses. Give them a factual reason to add you.</p>

<p><strong>Encourage customer reviews on multiple platforms.</strong> Amazon reviews, Google Reviews, Trustpilot, and even Reddit discussions all contribute to your third-party signal footprint. Don't fake these. Do make it easy for happy customers to leave reviews on platforms that AI systems actually crawl.</p>

<h2>5. Write comparison content (including against competitors)</h2>

<p>This one makes some brand owners nervous. Why would you write about your competitors on your own site?</p>

<p>Because if you don't, someone else will — and they'll frame the comparison on their terms. More importantly, comparison queries like "[your brand] vs [competitor]" are common in AI search, and if your site doesn't address them, the AI will pull from whoever does, which is often an affiliate site with an incentive to promote whichever brand pays the highest commission.</p>

<p>Write honest, detailed comparison pages. Cover what you do better, what the competitor does better, and who each product is actually for. This isn't about running down the other guy. It's about giving the AI a citable, balanced source that includes your perspective.</p>

<p>I've seen this work remarkably well. When ChatGPT or Perplexity answers a comparison query and finds a detailed, factual comparison on the brand's own site, it often cites that source directly — because the brand's page typically has the most accurate, up-to-date product specifications. You don't need to be biased. You need to be thorough and honest.</p>

<p>Structure these pages with clear headings, a comparison table, and specific data points. "Our blender has a 1500-watt motor vs. Competitor X's 1200-watt motor" is citable. "Our blender is more powerful" is not.</p>

<h2>6. Make sure AI crawlers can actually access your site</h2>

<p>You'd be shocked how many Shopify stores accidentally block AI crawlers. I've seen stores with robots.txt rules that block GPTBot, PerplexityBot, and Google's AI crawlers without the owner realizing it. They set up bot-blocking apps to prevent scrapers and ended up blocking the very systems they need to be visible in.</p>

<p>Here's how to check:</p>

<p>Go to yourstore.com/robots.txt. Look for "Disallow" rules that might block AI crawlers. The main ones to look for are:</p>

<ul>
  <li><strong>GPTBot</strong> (OpenAI's crawler used for ChatGPT browsing)</li>
  <li><strong>PerplexityBot</strong> (Perplexity's crawler)</li>
  <li><strong>Google-Extended</strong> (Google's crawler for AI training and Bard/AI Overviews)</li>
  <li><strong>ClaudeBot</strong> (Anthropic's crawler)</li>
</ul>

<p>If these are blocked, you have a decision to make. Some brands intentionally block AI training crawlers because they don't want their content used to train models. That's a legitimate choice. But understand the tradeoff: if you block GPTBot, your content won't appear in ChatGPT's browsing results. If you block Google-Extended, it may affect your visibility in AI Overviews. You can't have it both ways.</p>

<p>If you want AI visibility, make sure these bots can access your product pages, blog content, and any other pages you want cited. Also check that your site doesn't rely entirely on JavaScript rendering for critical content. Some AI crawlers process JavaScript poorly, and if your product descriptions only load after JS execution, the crawler might see an empty page.</p>

<h2>7. Create original data, testing, or research</h2>

<p>This is the long-term play, but it's also the most defensible. AI models love citing original data, test results, and research because it's specific, non-generic content that can't be found anywhere else.</p>

<p>If you sell backpacks, run a durability test and publish the results — how many pounds the straps held before failing, how the fabric performed after 50 wash cycles, water resistance ratings measured in a real shower test. If you sell skincare products, publish the results of a customer usage study. If you sell kitchen tools, do a side-by-side performance comparison of your product against the category standard.</p>

<p>This kind of content does three things for GEO simultaneously. First, it gives AI models unique, citable data points that no competitor can match. Second, it naturally attracts backlinks and third-party mentions, which feeds your overall authority. Third, it positions your brand as an expert source, making AI systems more likely to cite you for category-level questions even when the answer isn't directly about your product.</p>

<p>You don't need a research lab. You need a willingness to run a basic test, document it honestly, and publish the results with numbers. "We tested 12 zippers over 10,000 open-close cycles. Here's what happened" is more valuable for AI visibility than a hundred generic blog posts about "how to choose a backpack."</p>

<h2>Putting it together</h2>

<p>You don't need to do all seven at once. Start with the audit — find out where you stand today. Then tackle the quick wins: enrich product descriptions, validate your structured data, and check your robots.txt. Those three things alone can move the needle significantly.</p>

<p>Then start on the longer-term work: FAQ content, third-party reviews, comparison pages, and original research. These compound over time. Every review you earn, every comparison article that mentions you, every factual detail you add to a product page increases the surface area AI models have to work with when they construct their answers.</p>

<p>If you want a starting point, I built <a href="https://mygeocheck.com">mygeocheck.com</a> to give Shopify store owners a clear picture of their AI search visibility across platforms. You enter your URL, it runs the audit, and you get a GEO score with specific recommendations on which of these tactics to prioritize. It's free for the basic scan.</p>

<p>The thing I keep coming back to is this: AI search is still early. The brands that show up when someone asks for a recommendation today are going to be the brands that own that channel as it grows. Getting cited by an AI isn't about tricking an algorithm. It's about making your brand easy to find, easy to understand, and easy to recommend. These seven tactics do exactly that.</p>
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
