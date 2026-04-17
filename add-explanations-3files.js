#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Find question objects without explanation
  // Strategy: find each question object, check if it has explanation, if not add one
  const questionRegex = /\{ type: '(multiple_choice|true_false|fill_gap)', prompt: '((?:[^'\\]|\\.)*)'/g;

  let match;
  const replacements = [];

  while ((match = questionRegex.exec(content)) !== null) {
    const startIdx = match.index;
    let braceCount = 0;
    let endIdx = startIdx;
    for (let i = startIdx; i < content.length; i++) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIdx = i;
          break;
        }
      }
    }

    const questionStr = content.substring(startIdx, endIdx + 1);
    if (questionStr.includes('explanation:')) continue;

    const typeMatch = questionStr.match(/type: '([^']+)'/);
    const correctMatch = questionStr.match(/correctAnswer: '((?:[^'\\]|\\.)*)'/);
    const difficultyMatch = questionStr.match(/difficulty: '([^']+)'/);

    if (!typeMatch || !correctMatch || !difficultyMatch) continue;

    const qType = typeMatch[1];
    const prompt = match[2];
    const correct = correctMatch[1];
    const diff = difficultyMatch[1];

    const explanation = generateExplanation(qType, prompt, correct);

    const diffPattern = "difficulty: '" + diff + "'";
    const diffIdx = questionStr.indexOf(diffPattern);
    if (diffIdx !== -1) {
      const insertPos = startIdx + diffIdx + diffPattern.length;
      replacements.push({
        pos: insertPos,
        text: ", explanation: '" + explanation + "'"
      });
    }
  }

  console.log("Adding " + replacements.length + " explanations to " + path.basename(filePath));

  // Apply in reverse order
  replacements.sort((a, b) => b.pos - a.pos);
  for (const r of replacements) {
    content = content.substring(0, r.pos) + r.text + content.substring(r.pos);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Saved " + path.basename(filePath));
}

function generateExplanation(type, prompt, correctAnswer) {
  const p = prompt.replace(/\\'/g, "'").toLowerCase();
  const a = correctAnswer.replace(/\\'/g, "'");

  let explanation = getExplanation(type, p, a, correctAnswer);
  // Escape single quotes for TS
  explanation = explanation.replace(/'/g, "\\'");
  return explanation;
}

function getExplanation(type, p, a, rawCorrect) {
  if (type === 'true_false') {
    if (rawCorrect === 'True') return getTFTrue(p);
    return getTFFalse(p);
  }
  if (type === 'fill_gap') return getFG(p, a);
  return getMC(p, a);
}

// ==================== TRUE/FALSE TRUE ====================
function getTFTrue(p) {
  if (p.includes('constraints like word count')) return "Constraints give the AI clear boundaries, reducing ambiguity and producing more focused, usable output.";
  if (p.includes('explain like i')) return "Simplification prompts adjust the AI output complexity to match the intended audience level.";
  if (p.includes('few-shot prompting is more effective')) return "Examples show the AI exactly what style and format you want, which is more effective than abstract descriptions.";
  if (p.includes('zero-shot prompting means')) return "Zero-shot means no examples are provided. The AI relies entirely on its training and instructions.";
  if (p.includes('system prompts can be used to prevent')) return "System prompts can include instructions to refuse or redirect certain topics, acting as behavioral guardrails.";
  if (p.includes('well-crafted system prompt can significantly')) return "A detailed system prompt ensures consistent behavior, tone, and rules across all interactions.";
  if (p.includes('in the style of studio ghibli')) return "Style references guide the AI toward specific visual aesthetics learned from training data.";
  if (p.includes('negative prompts tell')) return "Negative prompts exclude unwanted elements, giving more precise control over generated images.";
  if (p.includes('aspect ratio parameters')) return "Aspect ratio parameters control the output shape, allowing wide, tall, or square image formats.";
  if (p.includes('batch generation lets')) return "Batch generation produces multiple variations at once for efficient comparison and selection.";
  if (p.includes('ai video tools can generate videos from text')) return "Text-to-video models create clips from written descriptions, though with current length limitations.";
  if (p.includes('ai can generate full songs with vocals')) return "Tools like Suno and Udio generate complete songs with vocals, instruments, and structure from text.";
  if (p.includes('musiclm by google')) return "Google MusicLM generates music from text descriptions, though access and rights vary.";
  if (p.includes('free tiers of ai music tools')) return "Free tiers limit downloads, quality, or commercial use. Paid plans unlock full features.";
  if (p.includes('ai can compose music in the style of classical')) return "AI trained on classical music datasets can mimic patterns and structures of composers like Bach.";
  if (p.includes('ai-composed music can be used for film')) return "AI composition is increasingly used for film scores, ads, and commercial background music.";
  if (p.includes('ai can sometimes suggest fixes that introduce')) return "AI fixes can have unintended side effects. Always test changes thoroughly before deploying.";
  if (p.includes('providing the programming language and framework version')) return "Version context helps the AI avoid deprecated methods or incompatible patterns.";
  if (p.includes('github copilot is an ai-powered code generation')) return "Copilot uses LLMs to suggest code completions and functions as you type in your editor.";
  if (p.includes('ai can generate boilerplate code')) return "AI excels at repetitive patterns like boilerplate and CRUD operations, saving development time.";
  if (p.includes('no-code platforms like bubble')) return "No-code platforms provide visual interfaces to connect AI services without writing code.";
  if (p.includes('no-code ai tools are ideal for rapid')) return "No-code tools allow fast iteration and testing before investing in custom development.";
  if (p.includes('ai pipelines can chain multiple')) return "Chaining models enables complex workflows where one output feeds into the next.";
  if (p.includes('error handling is an important')) return "Production pipelines must handle failures gracefully with retries, fallbacks, and alerts.";
  if (p.includes('rag allows ai to answer questions using')) return "RAG connects AI to your private data for accurate answers without retraining the model.";
  if (p.includes('rag eliminates the need to fine-tune')) return "RAG provides domain-specific knowledge at query time, avoiding the cost of fine-tuning.";
  if (p.includes('similar concepts have embeddings')) return "Embedding models map semantically related items to nearby points in vector space.";
  if (p.includes('happy" and "joyful"')) return "Synonyms produce similar vectors because they appear in similar contexts in training data.";
  if (p.includes('pinecone is a popular managed')) return "Pinecone offers a managed vector database optimized for similarity search at scale.";
  if (p.includes('vector databases are essential for building rag')) return "Vector databases enable fast similarity search, which is the retrieval step in RAG.";
  if (p.includes('fine-tuning requires significantly less data')) return "Fine-tuning leverages pre-trained knowledge, needing only task-specific examples.";
  if (p.includes('fine-tuning a model can make it worse')) return "Low-quality training data can degrade model performance through catastrophic forgetting.";
  if (p.includes('garbage in, garbage out applies')) return "AI output quality directly reflects training data quality. Flawed data produces flawed models.";
  if (p.includes('including diverse examples in training')) return "Diverse data helps the model handle wider input ranges and reduces overfitting.";
  if (p.includes('different ai models have different strengths')) return "Models excel in different areas. Selection should match your specific task requirements.";
  if (p.includes('prompt injection is a security vulnerability')) return "Prompt injection can override system instructions, potentially exposing data or producing harmful outputs.";
  if (p.includes('ai systems with access to tools') && p.includes('stricter')) return "Tool-using AI can take real-world actions, making security failures more consequential.";
  if (p.includes('disclosing when content is ai-generated')) return "Transparency about AI usage builds trust and meets emerging regulatory requirements.";
  if (p.includes('ai agents can use tools like web search')) return "Tool use distinguishes agents from chatbots, enabling interaction with external systems.";
  if (p.includes('human-in-the-loop approval is recommended')) return "Human oversight for high-stakes actions prevents costly mistakes and ensures alignment with intent.";
  if (p.includes('in multi-agent systems, different agents')) return "Role specialization allows each agent to focus on its strength for better results.";
  if (p.includes('crewai is a framework specifically')) return "CrewAI provides tools for defining agent roles, tasks, and collaboration patterns.";
  if (p.includes('lower temperature settings produce')) return "Lower temperature reduces randomness, producing more predictable and consistent outputs.";
  if (p.includes('saving and reusing effective prompts')) return "Templates ensure consistent quality by reusing proven instructions across similar tasks.";
  if (p.includes('using keyboard shortcuts and api access')) return "Power users automate interactions and integrate AI into existing workflows for efficiency.";
  if (p.includes('custom gpts can be shared publicly')) return "The GPT Store lets creators publish Custom GPTs for others to use.";
  if (p.includes('ai chatbots should seamlessly hand off')) return "Seamless escalation ensures complex issues get human attention while AI handles routine queries.";
  if (p.includes('ai can generate dozens of ad copy')) return "AI speeds up A/B testing by generating many copy variations simultaneously.";
  if (p.includes('ai can help segment audiences')) return "AI analyzes patterns at scale, identifying audience segments humans might miss.";
  if (p.includes('ai marketing tools work best when combined')) return "AI handles execution while humans provide strategic direction and brand judgment.";
  if (p.includes('stable diffusion is open-source while midjourney')) return "Stable Diffusion is open-source for local use, while Midjourney is a paid cloud service.";
  if (p.includes('you should test multiple ai tools')) return "Hands-on testing reveals which tool performs best for your specific use case.";
  if (p.includes('agi refers to ai that can match')) return "AGI would possess human-like reasoning across all domains, unlike current narrow AI.";
  if (p.includes('ai prompt engineering and ai management')) return "Roles like prompt engineer and AI ethics officer are emerging as AI adoption grows.";
  if (p.includes('effective ai workflows combine multiple')) return "Best workflows use AI for speed while humans review and make final decisions.";
  if (p.includes('ai workflow should include quality checks')) return "Quality checks catch AI errors and hallucinations before reaching end users.";
  if (p.includes('building a personal prompt library saves')) return "A curated library eliminates crafting prompts from scratch, ensuring consistent quality.";
  if (p.includes('prompt libraries should be regularly updated')) return "As AI models improve, prompts may need refinement to leverage new capabilities.";
  if (p.includes('ai can generate creative starting points')) return "AI generates raw material and variations that humans can curate and elevate.";
  if (p.includes('ai-generated content can serve as inspiration')) return "Using AI as a starting point leverages speed while maintaining creative authenticity.";
  if (p.includes('most creative use of ai comes from people')) return "Domain knowledge combined with AI fluency produces the best creative results.";
  if (p.includes('running ai locally keeps your data')) return "Local processing means data never leaves your machine, providing maximum privacy.";
  if (p.includes('gpt-4 vision and claude can analyze')) return "Multimodal models interpret images, charts, and documents alongside text.";
  if (p.includes('multimodal models can transcribe audio')) return "Modern multimodal AI handles multiple input types in a single interaction.";
  if (p.includes('you can charge premium rates for ai-powered')) return "AI-powered services deliver faster, higher-quality results that justify premium pricing.";
  if (p.includes('teaching others how to use ai')) return "AI education is a growing market as organizations seek to develop AI skills.";
  if (p.includes('building ai projects for your portfolio')) return "Portfolio projects demonstrate practical ability more effectively than certifications.";
  if (p.includes('publishing ai projects on github')) return "Public repositories showcase work to employers and clients, building credibility.";
  if (p.includes('ai mastery requires continuous learning')) return "The AI field evolves rapidly, requiring ongoing learning and adaptation.";
  if (p.includes('ai master should understand both the capabilities')) return "Knowing both capabilities and limitations enables maximum leverage without over-reliance.";
  if (p.includes('storyboard helps maintain visual consistency')) return "A storyboard provides consistent reference for style and narrative across clips.";
  if (p.includes('adding voiceover narration can mask')) return "Voiceover shifts attention to audio, making visual inconsistencies less noticeable.";
  if (p.includes('best ai video results come from iterating')) return "Iterating on prompts produces progressively better results than accepting first outputs.";
  if (p.includes('simple habit tracker can increase consistency')) return "Visual streaks create psychological commitment not to break the chain.";
  if (p.includes('improving 1% daily for a year')) return "1.01 to the power of 365 equals about 37.78, demonstrating compound improvement.";
  if (p.includes('getting 1% worse daily')) return "0.99 to the power of 365 equals about 0.03, showing how small declines compound.";
  if (p.includes('1% approach requires huge willpower')) return "Tiny improvements require minimal effort, making them sustainable long-term.";
  if (p.includes('"i am a runner" is more powerful')) return "Identity statements create self-reinforcing beliefs that make behavior feel natural.";
  if (p.includes('every action you take is a vote')) return "Each repeated action reinforces identity. Small wins accumulate as evidence.";
  if (p.includes('placing healthy snacks at eye level')) return "Making healthy options visible while hiding unhealthy ones is classic environment design.";
  if (p.includes('keeping your phone in another room while studying')) return "Physical separation removes the temptation trigger entirely.";
  if (p.includes('people with the best self-control')) return "Research shows good habits often result from better environments, not stronger willpower.";
  if (p.includes('turning off phone notifications')) return "Eliminating notifications removes a primary distraction source during focused work.";
  if (p.includes('social media is designed to be addictive')) return "Platforms use variable rewards and engagement algorithms designed to maximize usage.";
  if (p.includes('having your phone visible on the desk')) return "Research shows a visible phone reduces cognitive capacity even when turned off.";
  if (p.includes('deep work is the ability to focus')) return "Cal Newport defines deep work as focused, uninterrupted effort on demanding tasks.";
  if (p.includes('deep work is becoming increasingly rare')) return "As distractions increase, deep focus ability becomes a valuable competitive advantage.";
  if (p.includes('pomodoro technique recommends a 5-minute break')) return "Short breaks allow mental recovery while keeping you engaged for the next interval.";
  if (p.includes('naps of 10-20 minutes')) return "Short power naps restore alertness without causing grogginess from deeper sleep stages.";
  if (p.includes('batching emails into 2-3 check times')) return "Designated email times prevent constant context switching and protect focus blocks.";
  if (p.includes('batch cooking meals on sunday')) return "Batch cooking applies the same efficiency principle of doing similar work in one session.";
  if (p.includes('most important work should be scheduled during peak')) return "Peak energy provides cognitive resources for your most demanding and valuable work.";
  if (p.includes('cal newport recommends time blocking every minute')) return "Blocking every minute eliminates decisions about what to work on, freeing mental energy.";
  if (p.includes('buffer time between blocks')) return "Buffer blocks account for overruns and transitions, keeping the schedule realistic.";
  if (p.includes('weekly planning reduces daily decision fatigue')) return "Pre-deciding priorities eliminates daily deliberation about what to work on.";
  if (p.includes('flexible weekly plans are more sustainable')) return "Flexibility allows adapting to unexpected events while maintaining overall direction.";
  if (p.includes('quadrant 2') && p.includes('long-term success')) return "Quadrant 2 activities like planning and prevention create long-term success.";
  if (p.includes('tasks in quadrant 4')) return "Quadrant 4 tasks provide no value and should be eliminated to free up time.";
  if (p.includes('living in quadrant 1')) return "Constant crisis mode exhausts energy and prevents investment in prevention.";
  if (p.includes('effective delegation requires clear instructions')) return "Clear instructions prevent miscommunication and ensure delegated work meets expectations.";
  if (p.includes('micromanaging delegated tasks')) return "Micromanaging wastes your time and undermines the trust needed for effective delegation.";
  if (p.includes('short-term sacrifices often lead')) return "Investing effort now builds assets and skills that compound into long-term advantages.";
  if (p.includes('most people overestimate what they can do in a year')) return "Short-term expectations are often too high while long-term potential is vastly underestimated.";
  if (p.includes('immediate rewards are more effective for habit building')) return "The brain responds more strongly to immediate reinforcement for habit formation.";
  if (p.includes('reward should align with and not undermine')) return "Contradictory rewards create a self-defeating cycle that undermines long-term progress.";
  if (p.includes('celebrating small wins reinforces')) return "Celebration releases dopamine that reinforces the neural pathway for repetition.";
  if (p.includes('average person checks their phone over 90')) return "Studies show most people check phones 96-150 times daily, indicating digital dependency.";
  if (p.includes('social media companies design their apps')) return "Infinite scroll, notifications, and algorithmic feeds are designed to maximize screen time.";
  if (p.includes('dopamine fasting can help reset')) return "Reducing stimulation allows dopamine receptors to regain sensitivity.";
  if (p.includes('after a reset period, simple activities')) return "Recalibrated dopamine sensitivity makes normal activities genuinely enjoyable again.";
  if (p.includes('even 10 minutes of morning movement')) return "Brief morning exercise triggers neurochemical changes improving mood for hours.";
  if (p.includes('best routine is the one you can actually stick to')) return "Consistency trumps perfection. A simple routine you follow beats an elaborate abandoned one.";
  if (p.includes('evening routine is just as important')) return "Evening routines prepare for quality sleep and set up the next day.";
  if (p.includes('your routine should be flexible')) return "Built-in flexibility maintains consistency under real-world pressure.";
  if (p.includes('adding numbers or deadlines to a goal')) return "Quantifiable targets and timeframes transform intentions into trackable goals.";
  if (p.includes("parkinson's law states")) return "Without deadlines, tasks expand to fill available time, reducing efficiency.";
  if (p.includes('breaking a big goal into monthly and weekly')) return "Milestones create checkpoints that maintain motivation and enable course corrections.";
  if (p.includes('goals without deadlines tend to be')) return "Without deadlines, there is no urgency to act, causing indefinite delay.";
  if (p.includes('2-minute rule was popularized by david allen')) return "David Allen introduced the 2-minute rule in Getting Things Done for handling quick tasks.";
  if (p.includes('"read one page" is a valid')) return "Scaling to one page removes resistance and often leads to reading much more.";
  if (p.includes('procrastinators often know exactly')) return "Procrastination is emotional avoidance, not ignorance about what needs doing.";
  if (p.includes('action often creates motivation')) return "Starting generates momentum that fuels continued effort, reversing the expected order.";
  if (p.includes('setting artificial deadlines can reduce')) return "Self-imposed deadlines create urgency that drives action even without external pressure.";
  if (p.includes('having clear goals for a task helps trigger flow')) return "Clear goals provide direction and enable immediate feedback, prerequisites for flow.";
  if (p.includes('immediate feedback from the task helps maintain flow')) return "Feedback keeps engagement high by showing whether you are on track.";
  if (p.includes('single notification can break a flow state')) return "Flow is fragile. Brief interruptions collapse focus that took 15+ minutes to build.";
  if (p.includes('hydration and nutrition help sustain')) return "The brain requires consistent glucose and hydration for peak cognitive performance.";
  if (p.includes('complete darkness in the bedroom')) return "Even small amounts of light suppress melatonin and disrupt sleep quality.";
  if (p.includes('using your bed only for sleep trains')) return "Sleep restriction therapy uses this principle to strengthen the sleep response.";
  if (p.includes('going to bed and waking up at the same time')) return "Consistent times synchronize your circadian rhythm for better sleep quality.";
  if (p.includes('marcus aurelius, a roman emperor')) return "Marcus Aurelius wrote Meditations, a foundational text of Stoic philosophy.";
  if (p.includes('stoicism teaches that external events are neutral')) return "Events are neutral; our judgments and reactions create our experience of them.";
  if (p.includes('worrying about things outside your control')) return "Worrying about uncontrollables wastes energy and increases stress.";
  if (p.includes('epictetus, a former slave')) return "Epictetus demonstrated that focusing on controllables provides freedom regardless of circumstances.";
  if (p.includes('ryan holiday popularized stoicism')) return "Ryan Holiday brought Stoic philosophy to modern audiences through bestselling books.";
  if (p.includes('stoic practices can improve emotional regulation')) return "Regular Stoic practice builds resilience and the ability to respond rather than react.";
  if (p.includes('cold exposure activates the sympathetic')) return "Cold triggers sympathetic response, increasing alertness and norepinephrine release.";
  if (p.includes('wim hof popularized cold exposure')) return "Wim Hof demonstrated cold tolerance and popularized it for building mental resilience.";
  if (p.includes('cold showers have been shown to reduce inflammation')) return "Cold constricts blood vessels and reduces inflammatory markers, aiding recovery.";
  if (p.includes('self-talk significantly impacts mental toughness')) return "Positive self-talk strengthens resolve while negative self-talk undermines performance.";
  if (p.includes('telling someone your goals increases')) return "Social commitment creates external accountability that motivates follow-through.";
  if (p.includes('public commitments') && p.includes('posting goals')) return "Public declarations raise social stakes, making abandonment more difficult.";
  if (p.includes('cal newport wrote the book "digital minimalism"')) return "Cal Newport authored Digital Minimalism in 2019 for intentional technology use.";
  if (p.includes('most people would not miss 80%')) return "Most app usage concentrates in just a few apps, with the majority rarely opened.";
  if (p.includes('morning pages') && p.includes('3 pages')) return "Morning pages clear mental clutter through unfiltered stream-of-consciousness writing.";
  if (p.includes('journaling has been shown to reduce stress')) return "Studies confirm expressive writing reduces stress and improves mental clarity.";
  if (p.includes('energy levels fluctuate throughout the day')) return "Ultradian rhythms create 90-120 minute energy cycles throughout the day.";
  if (p.includes('nutrition, sleep, and exercise are the three pillars')) return "These three foundations provide the physical energy base for all performance.";
  if (p.includes('taking regular breaks actually increases')) return "Strategic breaks prevent burnout and restore cognitive resources for more output.";
  if (p.includes('making many decisions throughout the day depletes')) return "Each decision draws from a limited daily pool of willpower and mental energy.";
  if (p.includes('building habits reduces the need for willpower')) return "Automated habits bypass willpower, running on basal ganglia autopilot instead.";
  if (p.includes('blood glucose levels have been linked')) return "Some research links stable blood sugar to better self-control capacity.";
  if (p.includes('regular mindfulness practice has been shown')) return "Research confirms mindfulness reduces cortisol, improves attention, and enhances regulation.";
  if (p.includes("you don't rise to the level")) return "James Clear emphasizes that systems, not goals, determine actual outcomes.";
  if (p.includes('person with good systems but no specific goals')) return "Systems create daily consistency producing results regardless of specific goals.";
  if (p.includes('wheel of life tool rates')) return "The Wheel of Life visually reveals imbalances across major life areas.";
  if (p.includes('being honest about areas of dissatisfaction')) return "Honest self-assessment is the prerequisite for meaningful improvement.";
  if (p.includes('discipline mastery means motivation is no longer')) return "When habits run on autopilot, execution happens regardless of daily motivation.";
  if (p.includes('masters of discipline still face challenges')) return "Mastery means having systems to overcome obstacles, not avoiding them.";
  // Online Business
  if (p.includes('with fba, amazon handles storage')) return "FBA means Amazon manages the entire fulfillment process for your products.";
  if (p.includes('long-term storage fees increase significantly after 365')) return "Amazon charges higher fees for inventory stored over 365 days to discourage slow sellers.";
  if (p.includes('with pod, products are only printed after')) return "POD eliminates inventory risk by producing items only after customer orders.";
  if (p.includes('design quality and niche targeting')) return "Great designs targeted to passionate audiences drive POD sales in competitive markets.";
  if (p.includes('you can sell pod products on multiple')) return "Multi-platform distribution maximizes reach and reduces single-platform dependency.";
  if (p.includes('having hundreds of designs increases')) return "More designs mean more chances to discover bestsellers. Volume testing is core to POD.";
  if (p.includes('outsourcing design work to freelancers')) return "Freelance designers produce at scale while you focus on marketing and strategy.";
  if (p.includes('pod businesses can be fully automated')) return "With proper systems, POD can run with minimal daily involvement.";
  if (p.includes('narrower niches typically have less competition')) return "Narrow niches face less competition and attract more targeted, converting traffic.";
  if (p.includes('high-ticket affiliate niches') && p.includes('more per sale')) return "A single high-ticket sale can earn more than dozens of low-ticket sales.";
  if (p.includes('honest, detailed reviews build more trust')) return "Authentic reviews with pros and cons build credibility that drives conversions.";
  if (p.includes('seo-optimized affiliate content can generate passive')) return "Well-ranked content earns commissions from organic traffic for years.";
  if (p.includes('referrals from past clients')) return "Referrals come with built-in trust, resulting in higher conversion rates.";
  if (p.includes('upwork and fiverr are good platforms for beginners')) return "These platforms provide client access and help beginners build reviews.";
  if (p.includes('you should always have more clients in your pipeline')) return "A healthy pipeline prevents income gaps and reduces desperate client acceptance.";
  if (p.includes('hourly pricing penalizes you for getting faster')) return "Faster completion means less pay with hourly pricing, penalizing skill improvement.";
  if (p.includes('raising your prices typically loses')) return "Price increases usually lose only price-sensitive clients and attract better ones.";
  if (p.includes('scope creep') && p.includes('biggest threat')) return "Scope creep adds unpaid work eroding profitability. Clear contracts prevent this.";
  if (p.includes('content marketing costs 62%')) return "Content marketing delivers compounding returns as content attracts leads long after publication.";
  if (p.includes('repurposing one piece of content')) return "One piece can become posts, videos, and emails, multiplying its value across platforms.";
  if (p.includes('consistency in content publishing')) return "Regular publishing builds audience expectations and algorithm favor over time.";
  if (p.includes("you don't own your social media followers")) return "Platform changes can eliminate your reach overnight. Email lists are immune.";
  if (p.includes('engaging with your audience') && p.includes('replying')) return "Active engagement builds personal connections that transform followers into supporters.";
  if (p.includes('small, engaged audience is more valuable')) return "Engaged audiences buy and advocate. Large disengaged followings generate no value.";
  if (p.includes('churn rate measures the percentage')) return "Churn directly reduces revenue and indicates customer satisfaction problems.";
  if (p.includes('5% monthly churn rate means')) return "At 5% monthly churn, you retain only 54% of customers after 12 months.";
  if (p.includes('reducing churn by 1% has a bigger impact')) return "Reduced churn improves lifetime value for all future customers, compounding revenue.";
  if (p.includes('freemium models are a common')) return "Free plans let users experience value before paying, lowering acquisition costs.";
  if (p.includes('reducing time-to-value') && p.includes('improves conversion')) return "Faster value demonstration increases trial-to-paid conversion rates.";
  if (p.includes('it costs 5-7x more to acquire')) return "Existing customers cost nothing to acquire, making retention far more cost-effective.";
  if (p.includes('product pages with customer reviews convert')) return "Reviews provide social proof that reduces purchase anxiety for new buyers.";
  if (p.includes('reducing checkout steps typically')) return "Every additional checkout step is an opportunity for purchase abandonment.";
  if (p.includes('free shipping thresholds') && p.includes('increase average order')) return "Customers add items to reach free shipping, increasing average order value.";
  if (p.includes('offering multiple payment options') && p.includes('increases conversions')) return "Payment flexibility removes friction, preventing cart abandonment.";
  if (p.includes('relying on a single platform')) return "Single-platform dependency means one change could eliminate your entire revenue.";
  if (p.includes('amazon can change its rules')) return "Amazon regularly updates policies and fees, and can suspend accounts without warning.";
  if (p.includes('starting on one platform and expanding')) return "Mastering one platform first builds skills before adding multi-channel complexity.";
  if (p.includes('planning content in advance reduces daily stress')) return "Pre-planned content eliminates daily posting pressure, improving quality.";
  if (p.includes('content calendar helps identify gaps')) return "Visual calendars reveal imbalances in topic coverage and platform distribution.";
  if (p.includes('engagement rate is a more important metric')) return "Engagement measures actual connection, while follower count can be inflated.";
  if (p.includes('responding to every comment increases')) return "Active replies signal valuable content to algorithms and boost distribution.";
  if (p.includes('long-tail keywords') && p.includes('lower competition')) return "Long-tail keywords attract more specific, purchase-ready searchers with less competition.";
  if (p.includes('keywords with buying intent') && p.includes('convert better')) return "Buying-intent keywords indicate purchase readiness, yielding higher conversions.";
  if (p.includes('backlinks from authoritative websites significantly')) return "Quality backlinks signal trust and authority to Google, boosting rankings.";
  if (p.includes('one high-quality backlink')) return "Link quality matters far more than quantity for search rankings.";
  if (p.includes('email marketing has an average roi of $36')) return "Email delivers exceptional ROI through direct, owned audience access at near-zero cost.";
  if (p.includes('double opt-in') && p.includes('improves list quality')) return "Double opt-in confirms genuine interest, improving engagement rates.";
  if (p.includes('welcome email sequence typically has the highest open')) return "New subscribers are most engaged immediately after signing up.";
  if (p.includes('email sequences work while you sleep')) return "Automated sequences nurture leads 24/7 without manual effort.";
  if (p.includes('every email in a sequence should provide value')) return "Value-first emails build trust, making eventual sales pitches more effective.";
  if (p.includes('subject line is the biggest factor')) return "The subject line determines whether your email gets opened or ignored.";
  if (p.includes('a/b testing subject lines')) return "Testing reveals what resonates with your audience for systematically better rates.";
  if (p.includes('personalized emails') && p.includes('perform better')) return "Personalization increases relevance and makes subscribers feel valued.";
  if (p.includes('profitable business can still fail due to poor cash flow')) return "Profit on paper means nothing if you cannot pay bills when due.";
  if (p.includes('$1m revenue and 5% profit margin')) return "5% of one million equals fifty thousand, illustrating why revenue alone misleads.";
  if (p.includes('digital products') && p.includes('higher profit margins')) return "Digital products have near-zero marginal costs, resulting in very high margins.";
  if (p.includes('llc provides personal liability protection')) return "An LLC separates personal assets from business debts and lawsuits.";
  if (p.includes('you can change your business structure')) return "Many businesses start simple and convert to LLCs or S-Corps as they grow.";
  if (p.includes('business expenses like software, ads')) return "Deductible expenses reduce taxable income, lowering your tax burden.";
  if (p.includes('trademark protects your brand name')) return "Trademarks give exclusive rights to brand identifiers, preventing confusing copies.";
  if (p.includes('scaling too early before product-market fit')) return "Scaling before validation amplifies problems and burns cash without proven demand.";
  if (p.includes('fix operational problems before scaling')) return "Scaling multiplies problems. Fixing issues at small scale is far cheaper.";
  if (p.includes('healthy profit margins are more important than revenue growth')) return "Growth without margins means losing more money faster.";
  if (p.includes('virtual assistant') && p.includes('best first hire')) return "A VA handles admin tasks at a fraction of the cost of specialized hires.";
  if (p.includes('hiring for attitude and training for skill')) return "Skills can be taught but attitude and work ethic are harder to develop.";
  if (p.includes('business that depends entirely on the owner cannot scale')) return "Owner dependency creates a ceiling. Scaling requires systems others can operate.";
  if (p.includes('sops') && p.includes('make it possible to delegate')) return "SOPs let anyone execute tasks consistently without direct supervision.";
  if (p.includes('systems thinking means solving problems once')) return "Systems fix root causes permanently, eliminating the need for repeated intervention.";
  if (p.includes('blockchain transactions are transparent')) return "Blockchain immutability makes recorded transactions virtually impossible to alter.";
  if (p.includes('bitcoin was the first major application')) return "Bitcoin launched in 2009, demonstrating blockchain for decentralized digital currency.";
  if (p.includes('dollar-cost averaging') && p.includes('reduces the impact')) return "DCA spreads purchases over time, averaging out price volatility.";
  if (p.includes('defi aims to recreate traditional financial services')) return "DeFi uses smart contracts for lending, borrowing, and trading without banks.";
  if (p.includes('understanding defi risks') && p.includes('essential')) return "Smart contract vulnerabilities have caused billions in losses. Due diligence is essential.";
  if (p.includes('sales funnel narrows from many leads')) return "Not everyone who discovers your product will buy, creating the funnel shape.";
  if (p.includes('every online business needs a clear funnel')) return "Even simple funnels provide a framework for optimizing visitor-to-customer conversion.";
  if (p.includes('headline is the most important part')) return "80% read the headline but only 20% read the body. Headlines determine readership.";
  if (p.includes('features tell, benefits sell')) return "Benefits describe how the product improves the customer life, driving purchases.";
  if (p.includes('short, punchy sentences are generally more effective')) return "Short sentences create momentum, keeping readers moving toward the call to action.";
  if (p.includes('data-driven decisions consistently outperform')) return "Analytics remove guesswork, revealing what actually works for better outcomes.";
  if (p.includes('you should review analytics weekly')) return "Weekly reviews catch trends early enough for timely action.";
  if (p.includes('consistency across all touchpoints') && p.includes('strengthens')) return "Consistent branding builds recognition and trust across every customer interaction.";
  if (p.includes('people pay premium prices for strong brands')) return "Strong brands create perceived value and trust justifying higher prices.";
  if (p.includes('clear instructions and sops are essential for successful outsourcing')) return "Without clear documentation, outsourced workers cannot meet expectations.";
  if (p.includes('building long-term relationships with reliable outsourced')) return "Long-term workers understand your business deeply, improving quality over time.";
  if (p.includes('5% increase in customer retention')) return "Retained customers buy more, refer others, and cost nothing to acquire.";
  if (p.includes('loyalty programs and rewards increase')) return "Loyalty programs incentivize repeat business through structured rewards.";
  if (p.includes('personalized post-purchase follow-up')) return "Post-purchase emails show care beyond the sale, building loyalty.";
  if (p.includes('building anticipation before launch')) return "Pre-launch buzz creates demand that converts to immediate sales on release.";
  if (p.includes('limited-time launch pricing creates urgency')) return "Scarcity triggers loss aversion, motivating faster purchasing decisions.";
  if (p.includes('successful online moguls typically have multiple revenue')) return "Multiple streams provide stability and reduce single-source dependency.";
  if (p.includes('most "overnight success" stories')) return "Behind visible success is years of learning and iterating the public never sees.";

  // Generic true
  return "This statement is well-supported by research and industry best practices.";
}

// ==================== TRUE/FALSE FALSE ====================
function getTFFalse(p) {
  if (p.includes('vague prompts like')) return "Vague prompts produce vague results. AI needs specific instructions about topic, format, and audience.";
  if (p.includes('system prompts are visible')) return "System prompts are hidden from end users, setting behind-the-scenes behavioral rules.";
  if (p.includes('providing contradictory examples')) return "Contradictory examples confuse the AI and produce inconsistent outputs.";
  if (p.includes('ai-generated video content never requires')) return "AI video almost always needs human editing for quality control and polish.";
  if (p.includes('order of words in an image prompt has no effect')) return "Word order matters because AI models weight earlier tokens more heavily.";
  if (p.includes('higher resolution settings always produce better')) return "Higher resolution can amplify artifacts. Optimal resolution depends on the model.";
  if (p.includes('current ai video tools can generate feature-length')) return "Current tools generate 4-15 second clips. Longer content requires editing clips together.";
  if (p.includes('ai music generation requires formal')) return "AI music tools accept plain language, accessible without music theory knowledge.";
  if (p.includes('ai-generated music always sounds indistinguishable')) return "AI music still has subtle artifacts distinguishing it from human-made music.";
  if (p.includes('all ai music generation tools produce identical')) return "Each tool uses different models, producing distinct results from the same prompt.";
  if (p.includes('ai can debug code in any programming language equally')) return "AI performs better with popular languages that have more training data.";
  if (p.includes('understanding the code ai generates is unnecessary')) return "Understanding code is essential for debugging and maintaining it long-term.";
  if (p.includes('no-code ai tools can scale to handle enterprise')) return "No-code tools have limitations in customization and scalability for enterprise needs.";
  if (p.includes('ai pipeline that works in development')) return "Production environments differ in volume, latency, and edge cases from development.";
  if (p.includes('rag systems always return perfectly accurate')) return "RAG can produce errors if retrieval finds wrong documents or AI misinterprets context.";
  if (p.includes('embeddings can only represent text')) return "Multimodal models represent text, images, audio, and more in the same space.";
  if (p.includes('traditional sql databases are better than vector')) return "Vector databases use similarity search, which is fundamentally better for semantic retrieval.";
  if (p.includes('fine-tuning is free')) return "Fine-tuning requires GPU compute, incurring costs through cloud APIs or hardware.";
  if (p.includes('more training data is always better')) return "Low-quality data introduces noise and biases. Quality matters more than volume.";
  if (p.includes('largest ai model is always the best')) return "Smaller models can be faster and cheaper while sufficient for simple tasks.";
  if (p.includes('ai safety is only a concern for large')) return "Any developer deploying AI must consider safety regardless of company size.";
  if (p.includes('companies have no ethical obligation')) return "Responsible AI requires bias testing before deployment to prevent discrimination.";
  if (p.includes('ai agents should have unlimited permissions')) return "Unlimited permissions create security risks. Agents need least-privilege boundaries.";
  if (p.includes('multi-agent systems are always more efficient')) return "Single agents can be more efficient for simple tasks than multi-agent overhead.";
  if (p.includes('creating a custom gpt requires programming')) return "Custom GPTs are built through conversation, no coding required.";
  if (p.includes('custom gpts retain memory')) return "Each conversation starts fresh without persistent memory across sessions.";
  if (p.includes('customers generally prefer ai that pretends')) return "Research shows customers prefer transparency about AI. Pretending erodes trust.";
  if (p.includes('ai customer service completely eliminates')) return "Human agents remain essential for complex, emotional, or unique situations.";
  if (p.includes('all ai image generators produce identical results')) return "Each tool uses different models, producing distinct outputs from the same prompt.";
  if (p.includes('most expensive ai tool is always')) return "The best tool solves your specific problem cost-effectively, not the priciest one.";
  if (p.includes('one ai tool is sufficient for all')) return "Different tasks benefit from different tools. Most businesses use combinations.";
  if (p.includes('most ai researchers agree on an exact date')) return "AGI timelines range widely with no scientific consensus on arrival.";
  if (p.includes('current llms like gpt-4 and claude are considered agi')) return "Current LLMs are narrow AI excelling at language but lacking general reasoning.";
  if (p.includes('learning ai skills will become less important')) return "AI literacy is increasingly essential as AI integrates into every industry.";
  if (p.includes('once an ai workflow is set up, it never needs')) return "Workflows need regular maintenance as AI models and APIs change.";
  if (p.includes('prompt that works perfectly on one ai model')) return "Different models interpret prompts differently, often requiring adjustments.";
  if (p.includes('local ai models are always as powerful')) return "Cloud models are typically more capable than local models limited by hardware.";
  if (p.includes('multimodal ai is equally strong')) return "Models typically excel in one modality with varying quality in others.";
  if (p.includes('market for ai services is shrinking')) return "The AI services market is expanding rapidly as adoption accelerates.";
  if (p.includes('ai mastery is a destination')) return "AI evolves rapidly, requiring continuous learning to maintain mastery.";
  if (p.includes('breaking a streak once means')) return "Missing once is a stumble, not failure. Never miss twice in a row.";
  if (p.includes('identity change happens overnight')) return "Identity builds through accumulated evidence over time, not single events.";
  if (p.includes('most people can sustain more than 4 hours')) return "Research suggests 3-4 hours is the maximum for truly deep focus per day.";
  if (p.includes('skipping breaks leads to more productivity')) return "Continuous work causes diminishing returns as cognitive fatigue accumulates.";
  if (p.includes('context switching between unrelated tasks has zero')) return "Every context switch imposes cognitive cost, reducing quality and speed.";
  if (p.includes('overloading your weekly plan with 50 tasks')) return "Too many tasks create overwhelm. A focused plan of 3-5 priorities works better.";
  if (p.includes('delegation is a sign of weakness')) return "Effective delegation is a leadership strength that multiplies team output.";
  if (p.includes('long-term thinking means never enjoying')) return "Long-term thinking guides decisions without eliminating present enjoyment.";
  if (p.includes('digital detox means you can never')) return "A digital detox is a temporary reset, not permanent rejection of technology.";
  if (p.includes('you need to do a 30-day fast')) return "Even 24-48 hours of reduced stimulation meaningfully resets dopamine baseline.";
  if (p.includes('checking your phone should come before morning')) return "Phone-first mornings trigger reactive mode. Movement builds proactive energy.";
  if (p.includes('morning movement must be intense')) return "Even gentle movement like walking provides significant mood and energy benefits.";
  if (p.includes('"i want to lose weight" is a specific')) return "This goal lacks target amount, timeline, or method, making progress unmeasurable.";
  if (p.includes('vague goals are just as effective')) return "Research shows specific, measurable goals consistently outperform vague ones.";
  if (p.includes('2-minute rule should only be used for exercise')) return "The 2-minute rule applies to any habit, not just exercise.";
  if (p.includes('you can enter flow while multitasking')) return "Flow requires single-task focus. Multitasking prevents deep absorption.";
  if (p.includes('you can force yourself into flow')) return "Flow emerges from right conditions. Forcing it is counterproductive.";
  if (p.includes('cluttered bedroom has no effect')) return "Visual clutter creates subconscious stress interfering with sleep onset.";
  if (p.includes('alcohol helps you get deeper')) return "Alcohol disrupts REM sleep and overall sleep quality despite aiding sleep onset.";
  if (p.includes('you can fully catch up on a week of poor')) return "Sleep debt does not fully repay, and weekend oversleeping disrupts circadian rhythm.";
  if (p.includes('stoicism encourages suppressing all emotions')) return "Stoicism teaches managing emotions wisely, not eliminating them.";
  if (p.includes('focusing on what you can control means you should never plan for risks')) return "Risk planning is prudent action within your control.";
  if (p.includes('modern stoicism is only useful for philosophers')) return "Stoic principles are practical tools for emotional regulation and resilience.";
  if (p.includes('mental toughness is a trait you are born with')) return "Mental toughness develops through consistent exposure to manageable challenges.";
  if (p.includes('mentally tough people never feel fear')) return "Mentally tough people feel fear but act despite it.";
  if (p.includes('self-accountability alone is usually sufficient')) return "Most people benefit from external accountability because self-consequences are negotiable.";
  if (p.includes('digital minimalists never use social media')) return "Digital minimalism is intentional use, not technology abstinence.";
  if (p.includes('journal entries need to be perfectly')) return "Journaling is a private tool. Perfectionism defeats its purpose.";
  if (p.includes('goal of mindfulness is to stop all thoughts')) return "The goal is observing thoughts without attachment, not eliminating them.";
  if (p.includes('once you build a good system, you never need')) return "Systems require regular review and adjustment as circumstances change.";
  if (p.includes('life audit should only focus on your career')) return "Comprehensive audits cover health, relationships, growth, and more.";
  if (p.includes('discipline mastery is a final destination')) return "Discipline requires continuous effort, adjustment, and growth.";
  // Online Business false
  if (p.includes('you need to handle customer returns yourself with fba')) return "Amazon manages returns for FBA sellers, including communication and refunds.";
  if (p.includes('mobile-optimized product pages are optional')) return "Over 70% of e-commerce traffic is mobile, making optimization essential.";
  if (p.includes('content calendars should be completely rigid')) return "Leaving room for trending topics keeps content relevant and responsive.";
  if (p.includes('buying fake engagement')) return "Fake engagement damages metrics, algorithm performance, and risks penalties.";
  if (p.includes('targeting keywords with extremely high competition is the best')) return "New sites lack authority for high-competition keywords. Start with lower difficulty.";
  if (p.includes('buying hundreds of cheap backlinks')) return "Google penalizes link schemes. Low-quality backlinks cause ranking drops.";
  if (p.includes('buying email lists is an effective')) return "Purchased lists have low engagement and violate platform terms of service.";
  if (p.includes('revenue and cash flow are the same')) return "Revenue is earned money while cash flow is received money. Timing differs.";
  if (p.includes('revenue growth without profit growth is sustainable')) return "Revenue without profit means spending more to grow, which is unsustainable.";
  if (p.includes('sole proprietorship offers the same liability')) return "Sole proprietorships offer zero liability protection for personal assets.";
  if (p.includes('you should wait until tax season')) return "Year-round organization prevents tax-season panic and enables better decisions.";
  if (p.includes('hiring a bookkeeper or accountant is a waste')) return "Good accountants typically save more in tax optimization than their cost.";
  if (p.includes('verbal agreements are always as enforceable')) return "Verbal agreements are hard to prove. Written contracts provide clear documentation.";
  if (p.includes('copyrighted content without permission') && p.includes('legal if you give credit')) return "Credit does not substitute for permission. Copyright requires authorization.";
  if (p.includes('you should hire a full team before validating')) return "Hiring before validation creates overhead that can sink an unproven business.";
  if (p.includes('cheapest outsourced worker is always')) return "The cheapest option often costs more in revisions. Value matters more than price.";
  if (p.includes('sales funnel should be set up once and never')) return "Funnels need continuous optimization based on performance data.";
  if (p.includes('product launch is a one-time event with no follow-up')) return "Post-launch activities sustain sales beyond initial excitement.";
  if (p.includes('brand can be built overnight')) return "Brands build through consistent quality delivery over time, not viral moments.";
  if (p.includes('tracking every business expense is unnecessary')) return "Expense tracking is essential for tax compliance and profit optimization.";
  if (p.includes('keeping crypto on an exchange is safer')) return "Exchanges can be hacked. Hardware wallets give you sole control over your keys.";
  if (p.includes('past performance in crypto markets guarantees')) return "Crypto is highly unpredictable. Past returns do not guarantee future results.";
  if (p.includes('defi protocols carry no risk')) return "DeFi carries significant risks including smart contract bugs and rug pulls.";
  if (p.includes('vanity metrics') && p.includes('more important than actionable')) return "Vanity metrics look good but do not inform decisions. Actionable metrics drive results.";
  if (p.includes('reaching online mogul status means you never need')) return "Business environments change constantly. Continuous learning is essential.";
  if (p.includes('you should choose an affiliate niche you have zero')) return "Knowledge and interest in your niche create better, more authentic content.";
  if (p.includes('promoting products you have never used')) return "Promoting unknown products risks recommending poor quality, damaging credibility.";
  if (p.includes('blockchain technology is only useful for cryptocurrency')) return "Blockchain has applications in supply chain, identity, voting, and more.";
  return "This is a common misconception contradicted by research and best practices.";
}

// ==================== FILL GAP ====================
function getFG(p, a) {
  // Return concise explanation for the correct fill-gap answer
  // Using a mapping approach - each unique fill-gap gets a targeted explanation

  // Generic but educational approach: explain why the correct word fits
  const filled = p.replace(/\\\'/g, "'").replace('___', a);

  // Try specific matches first for quality
  if (a.toLowerCase() === 'tone') return "Tone shapes how the AI communicates, ensuring output matches your intended voice and audience.";
  if (p.includes('specifying the') && a.toLowerCase() === 'audience') return "Defining the audience helps the AI adjust vocabulary and complexity appropriately.";
  if (a.toLowerCase() === 'few' && p.includes('shot')) return "Few-shot prompting gives 2-5 examples to help the AI match desired patterns.";
  if (a.toLowerCase() === 'pattern' && p.includes('examples serve')) return "Examples create a pattern the AI recognizes and replicates in its output.";
  if (a.toLowerCase() === 'personality' && p.includes('role')) return "Personality ensures the AI maintains consistent character throughout interactions.";
  if (a.toLowerCase() === 'before' && p.includes('system prompts run')) return "System prompts execute before user interaction, establishing behavior from the start.";
  if (a.toLowerCase() === 'atmosphere') return "Lighting, mood, and color palette combine to create the overall feeling of the image.";
  if (a.toLowerCase() === 'aesthetic') return "This phrase biases the model toward high-quality digital art from popular platforms.";
  if (a.toLowerCase() === 'steps' && p.includes('refinement')) return "More steps produce more detailed images but take longer to generate.";
  if (a.toLowerCase() === 'regenerate') return "Inpainting regenerates only the masked area, fixing problems without redoing the whole image.";
  if (a.toLowerCase() === 'clips' && p.includes('video generators')) return "Current AI video technology generates brief clips that need editing for longer content.";
  if (a.toLowerCase() === 'avatar') return "AI avatar tools animate static images into talking head videos for presentations.";
  if (a.toLowerCase() === 'editing' && p.includes('video')) return "Video editing software assembles AI clips with transitions, music, and effects.";
  if (a.toLowerCase() === 'voiceover' && p.includes('video')) return "Human voiceover ties AI visuals together into a cohesive story.";
  if (a.toLowerCase() === 'genres') return "Genre specification helps AI select appropriate instruments, tempo, and patterns.";
  if (a.toLowerCase() === 'deep' && p.includes('learning')) return "Deep learning models analyze music dataset patterns to generate new compositions.";
  if (a.toLowerCase() === 'song' && p.includes('udio')) return "Udio specializes in high-quality complete song generation across many genres.";
  if (a.toLowerCase() === 'tempo' && p.includes('soundraw')) return "Tempo control matches music pace to your content energy needs.";
  if (a.toLowerCase() === 'daw') return "A DAW (Digital Audio Workstation) lets musicians edit AI-generated MIDI professionally.";
  if (a.toLowerCase() === 'style' && p.includes('artist')) return "Training on an artist catalog teaches the AI their characteristic musical patterns.";
  if (a.toLowerCase() === 'test' && p.includes('debugging')) return "Testing validates that a fix works correctly without introducing new problems.";
  if (a.toLowerCase() === 'relevant' && p.includes('debuggers')) return "Focused context improves debugging accuracy by reducing noise.";
  if (a.toLowerCase() === 'reviewed' && p.includes('code')) return "Human review catches security and logic issues AI may miss or introduce.";
  if (a.toLowerCase() === 'context' && p.includes('function signatures')) return "Clear context helps AI understand code requirements for more accurate generation.";
  if (a.toLowerCase() === 'drag-and-drop') return "Visual interfaces make AI workflows accessible without programming skills.";
  if (a.toLowerCase() === 'developers' && p.includes('non-')) return "No-code platforms let business users build AI solutions directly.";
  if (a.toLowerCase() === 'preprocessing') return "Preprocessing cleans and formats raw data for effective AI model processing.";
  if (a.toLowerCase() === 'logging') return "Logging tracks pipeline performance and errors for debugging and improvement.";
  if (a.toLowerCase() === 'retrieving') return "The retrieval step finds relevant documents before AI generates a response.";
  if (a.toLowerCase() === 'chunks') return "Chunking breaks documents into pieces that fit within AI context windows.";
  if (a.toLowerCase() === 'numbers' && p.includes('embeddings')) return "Numerical vectors enable mathematical comparison of semantic text similarity.";
  if (a.toLowerCase() === 'vector' && p.includes('embeddings are stored')) return "Vector databases optimize fast similarity searches across embedding spaces.";
  if (a.toLowerCase() === 'mathematical') return "Cosine similarity measures the angle between vectors to determine content relatedness.";
  if (a.toLowerCase() === 'vector' && p.includes('chroma')) return "Chroma provides a lightweight open-source vector database for development.";
  if (a.toLowerCase() === 'task' && p.includes('specialized')) return "Fine-tuning adapts a general model to excel at your specific task.";
  if (a.toLowerCase() === 'output' && p.includes('input-')) return "Input-output pairs teach the model what response to produce for each input type.";
  if (a.toLowerCase() === 'cleaned') return "Clean data prevents the model from learning errors present in raw data.";
  if (a.toLowerCase() === 'cleaning' && p.includes('data')) return "Data cleaning ensures accuracy and consistency before model training.";
  if (a.toLowerCase() === 'faster' && p.includes('smaller')) return "Smaller models handle simple tasks efficiently with lower latency and cost.";
  if (a.toLowerCase() === 'performance' && p.includes('benchmarks')) return "Benchmarks provide comparable metrics for evaluating different models.";
  if (a.toLowerCase() === 'hallucination') return "Hallucination is when AI generates convincing but fabricated information.";
  if (a.toLowerCase() === 'filtering') return "Content filtering scans outputs for harmful content before delivery to users.";
  if (a.toLowerCase() === 'transparency') return "Transparency makes AI decision processes understandable for accountability.";
  if (a.toLowerCase() === 'risk' && p.includes('eu ai act')) return "The EU AI Act imposes stricter requirements on higher-risk AI applications.";
  if (a.toLowerCase() === 'think' && p.includes('observe')) return "The think step enables agents to plan before acting on observations.";
  if (a.toLowerCase() === 'permissions') return "Permission boundaries prevent agents from taking unauthorized actions.";
  if (a.toLowerCase() === 'messages' && p.includes('agents')) return "Message passing allows agents to coordinate actions and share information.";
  if (a.toLowerCase() === 'division') return "Division of labor lets each agent focus on its specialty.";
  if (a.toLowerCase() === 'system' && p.includes('using ___ prompts')) return "System prompts establish AI role and rules before user interaction.";
  if (a.toLowerCase() === 'templates') return "Templates standardize recurring tasks for consistent quality.";
  if (a.toLowerCase() === 'reference' && p.includes('custom gpt')) return "Uploaded files serve as a knowledge base the GPT can reference.";
  if (a.toLowerCase() === 'apis' && p.includes('external')) return "API integration allows GPTs to fetch live data and trigger external actions.";
  if (a.toLowerCase() === '80' && p.includes('resolve')) return "AI chatbots handle most common queries, freeing agents for complex issues.";
  if (a.toLowerCase() === 'knowledge' && p.includes('customer service')) return "Training on your knowledge base improves AI customer service accuracy.";
  if (a.toLowerCase() === 'sentiment') return "Sentiment analysis determines if feedback is positive, negative, or neutral.";
  if (a.toLowerCase() === 'writing' && p.includes('jasper')) return "AI writing tools generate marketing copy at scale, accelerating production.";
  if (a.toLowerCase() === 'openai' && p.includes('dall-e')) return "OpenAI created DALL-E and integrated it into ChatGPT for image generation.";
  if (a.toLowerCase() === 'discord') return "Midjourney uses Discord as its interface for submitting image prompts.";
  if (a.toLowerCase() === 'problem' && p.includes('define')) return "Starting with the problem ensures tool selection addresses actual needs.";
  if (a.toLowerCase() === 'ease of use') return "Ease of use affects adoption and daily productivity critically.";
  if (a.toLowerCase() === 'specific' && p.includes('excel at')) return "Current AI excels at defined tasks but cannot reason generally across domains.";
  if (a.toLowerCase() === 'values' && p.includes('alignment')) return "The alignment problem ensures AI pursues goals beneficial to humanity.";
  if (a.toLowerCase() === 'repetitive' && p.includes('at risk')) return "Highly repetitive tasks are easiest to automate, putting those roles at risk.";
  if (a.toLowerCase() === 'augment') return "Most AI implementations enhance human capabilities rather than replacing workers.";
  if (a.toLowerCase() === 'sop') return "SOPs ensure anyone can follow workflows consistently for delegation.";
  if (a.toLowerCase() === 'repetitive' && p.includes('save time')) return "Automating repetitive tasks frees humans for creative and strategic work.";
  if (a.toLowerCase() === 'difficulty' && p.includes('organize prompts')) return "Organizing by difficulty helps users find appropriate prompts for their level.";
  if (a.toLowerCase() === 'variables') return "Variables make prompts reusable by swapping in different values per use case.";
  if (a.toLowerCase() === 'judgment') return "Human judgment guides creative processes, selecting the best AI outputs.";
  if (a.toLowerCase() === 'block' && p.includes('creative')) return "AI generates alternatives helping creators push past mental blocks.";
  if (a.toLowerCase() === 'local' && p.includes('ollama')) return "Ollama simplifies running open-source models locally.";
  if (a.toLowerCase() === 'precision') return "Quantization reduces numerical precision to lower memory requirements.";
  if (a.toLowerCase() === 'description' && p.includes('photo')) return "Vision AI analyzes images and generates natural language descriptions.";
  if (a.toLowerCase() === 'versatile') return "Multiple input types make multimodal AI more flexible than text-only models.";
  if (a.toLowerCase() === 'tools' && p.includes('selling ai')) return "AI tools provide scalable income since they sell repeatedly.";
  if (a.toLowerCase() === 'consulting') return "AI consulting agencies help businesses implement and optimize AI solutions.";
  if (a.toLowerCase() === 'problem' && p.includes('good ai project')) return "Starting with a real problem ensures tangible project value.";
  if (a.toLowerCase() === 'lessons') return "Sharing lessons learned builds credibility and helps others.";
  if (a.toLowerCase() === 'principles') return "Understanding principles lets you adapt quickly as tools change.";
  if (a.toLowerCase() === 'leverage') return "Teaching multiplies your impact and positions you as an authority.";

  // Discipline fill gaps
  if (a.toLowerCase() === 'measured') return "Peter Drucker popularized this: measuring something focuses attention and drives improvement.";
  if (a.toLowerCase() === 'weekly' && p.includes('tracked data')) return "Weekly reviews spot trends while keeping the reflection habit manageable.";
  if (a.toLowerCase() === 'compound') return "Compound growth means improvements build on previous gains exponentially.";
  if (a.toLowerCase() === 'habits' && p.includes('atomic')) return "Atomic Habits by James Clear is the definitive book on small habit formation.";
  if (a.toLowerCase() === 'beliefs') return "Changing beliefs about identity makes desired behaviors feel natural.";
  if (a.toLowerCase() === 'shows up') return "Identity affirmations reinforce the self-image of someone who takes action.";
  if (a.toLowerCase() === 'obvious') return "Making good habits visible leverages environment design for automatic behavior.";
  if (a.toLowerCase() === 'friction') return "Added friction makes bad habits harder, reducing frequency without willpower.";
  if (a.toLowerCase() === 'switching' && p.includes('multitasking')) return "The brain rapidly switches between tasks, losing efficiency each time.";
  if (a.toLowerCase() === 'space' && p.includes('dedicated')) return "A dedicated space creates cues that prime your brain for focused work.";
  if (a.toLowerCase() === 'ritual') return "Rituals create automatic behavioral cues for faster entry into focus.";
  if (a.toLowerCase() === 'shallow') return "Shallow work includes email and admin that do not require deep concentration.";
  if (a.toLowerCase() === 'stepping away') return "Physical distance from screens allows genuine mental and physical recovery.";
  if (a.toLowerCase() === 'restore' && p.includes('nature')) return "Nature exposure restores attention and reduces stress hormones.";
  if (a.toLowerCase() === 'switching' && p.includes('batching')) return "Batching eliminates the cognitive cost of switching between task types.";
  if (a.toLowerCase() === 'content' && p.includes('batch-create')) return "Batch creation is more efficient due to reduced setup time.";
  if (a.toLowerCase() === 'blocks') return "Priority blocks are your most valuable work time to defend from interruptions.";
  if (a.toLowerCase() === 'first' && p.includes('eat the frog')) return "Tackling the hardest task first uses peak willpower before it depletes.";
  if (a.toLowerCase() === 'worked') return "Reviewing results creates a feedback loop for continuous improvement.";
  if (a.toLowerCase() === '15-30') return "15-30 minutes is enough to set priorities without overcomplicating planning.";
  if (a.toLowerCase() === 'delegated') return "Delegating urgent but unimportant tasks frees you for important work.";
  if (a.toLowerCase() === '3' && p.includes('quadrant')) return "Quadrant 3 tasks feel urgent but do not advance your goals.";
  if (a.toLowerCase() === 'losing') return "Fear of losing control is the main psychological barrier to delegation.";
  if (a.toLowerCase() === 'outcome') return "Defining desired outcome gives delegates clarity about success criteria.";
  if (a.toLowerCase() === 'minimization') return "The regret minimization framework evaluates decisions from an end-of-life perspective.";
  if (a.toLowerCase() === 'delay' && p.includes('marshmallow')) return "Children who delayed gratification showed better outcomes decades later.";
  if (a.toLowerCase() === 'reward' && p.includes('dopamine')) return "Dopamine drives the reward system, making you want to repeat rewarding behaviors.";
  if (a.toLowerCase() === 'melatonin' && p.includes('screen time')) return "Blue light suppresses melatonin, the hormone signaling sleep time.";
  if (a.toLowerCase() === 'stimulating') return "Removing color makes phones less visually engaging, reducing compulsive use.";
  if (a.toLowerCase() === 'dopamine' && p.includes('overstimulation')) return "Elevated dopamine baseline makes normal activities feel unrewarding.";
  if (a.toLowerCase() === 'motivation') return "Regular resets maintain dopamine sensitivity for everyday motivation.";
  if (a.toLowerCase() === 'circadian') return "Morning sunlight synchronizes your internal clock for better energy and sleep.";
  if (a.toLowerCase() === 'clothes') return "Preparing workout clothes removes morning friction for easier habit start.";
  if (a.toLowerCase() === 'stacking') return "Habit stacking uses existing habits as triggers for new ones.";
  if (a.toLowerCase() === 'fatigue' && p.includes('decision')) return "Automated routines preserve mental energy for important choices.";
  if (a.toLowerCase() === 'smart') return "SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound.";
  if (a.toLowerCase() === 'measurable') return "Measurable goals include quantifiable criteria for tracking progress.";
  if (a.toLowerCase() === 'time-bound') return "Time-bound goals have deadlines creating urgency and preventing postponement.";
  if (a.toLowerCase() === 'sprint') return "90-day sprints are long enough for progress but short enough for focus.";
  if (a.toLowerCase() === 'scale' && p.includes('2-minute')) return "Scaling down to 2 minutes removes resistance for starting any new habit.";
  if (a.toLowerCase() === 'starting') return "Starting creates momentum. Once begun, continuing feels much easier.";
  if (a.toLowerCase() === 'steps' && p.includes('smaller')) return "Smaller steps reduce overwhelm that triggers procrastination.";
  if (a.toLowerCase() === 'social' && p.includes('accountability')) return "Social pressure motivates because humans maintain commitments to others.";
  if (a.toLowerCase() === 'anxiety' && p.includes('challenge')) return "Tasks beyond skill level cause anxiety instead of flow.";
  if (a.toLowerCase() === 'unpredictability') return "Environmental unpredictability captures attention, creating flow conditions.";
  if (a.toLowerCase() === '2-4' && p.includes('flow')) return "Deep flow sessions typically last 45 minutes to 4 hours.";
  if (a.toLowerCase() === 'lyrics') return "Lyrics engage language processing that competes with focused work.";
  if (a.toLowerCase() === 'melatonin' && p.includes('blue light')) return "Blue light specifically suppresses melatonin, delaying sleep onset.";
  if (a.toLowerCase() === 'curtains') return "Blackout curtains eliminate external light disrupting sleep cycles.";
  if (a.toLowerCase() === '8' && p.includes('caffeine')) return "Caffeine half-life of 5-6 hours means 8 hours allows most to clear.";
  if (a.toLowerCase() === 'routine' && p.includes('pre-sleep')) return "Consistent wind-down routines train your brain to associate with sleep.";
  if (a.toLowerCase() === 'premeditatio malorum') return "This Stoic exercise reduces fear by mentally rehearsing worst-case scenarios.";
  if (a.toLowerCase() === 'imagination') return "Seneca observed that anticipatory anxiety often causes more suffering than reality.";
  if (a.toLowerCase() === 'way' && p.includes('obstacle')) return "This Stoic principle means obstacles are opportunities for growth.";
  if (a.toLowerCase() === 'discomfort' && p.includes('voluntary')) return "Voluntary discomfort builds resilience through manageable hardship practice.";
  if (a.toLowerCase() === 'dopamine' && p.includes('cold showers')) return "Cold exposure triggers significant dopamine release improving mood and alertness.";
  if (a.toLowerCase() === 'discomfort' && p.includes('cold exposure trains')) return "Acting despite physical discomfort builds discipline transferable everywhere.";
  if (a.toLowerCase() === '40') return "The 40% rule suggests you have much more capacity than your mind indicates.";
  if (a.toLowerCase() === 'muscle' && p.includes('mental toughness')) return "Like a muscle, mental toughness strengthens with consistent use.";
  if (a.toLowerCase() === 'partner') return "An accountability partner provides external motivation and honest feedback.";
  if (a.toLowerCase() === 'money' && p.includes('beeminder')) return "Financial stakes create stronger accountability through concrete consequences.";
  if (a.toLowerCase() === 'purpose') return "Keeping only purposeful technology prevents mindless time consumption.";
  if (a.toLowerCase() === 'intentional') return "Intentional technology use means every app earns its place through value.";
  if (a.toLowerCase() === '3' && p.includes('gratitude')) return "Writing three gratitudes daily trains your brain to notice positive aspects.";
  if (a.toLowerCase() === 'reflection') return "Bullet journaling integrates productivity with self-awareness.";
  if (a.toLowerCase() === 'spiritual') return "Spiritual energy comes from purpose and meaning, sustaining all other energy.";
  if (a.toLowerCase() === 'energy' && p.includes('peak')) return "Peak energy hours maximize cognitive performance on important tasks.";
  if (a.toLowerCase() === 'decisions' && p.includes('reducing daily')) return "Fewer routine decisions preserve mental energy for important choices.";
  if (a.toLowerCase() === 'decision' && p.includes('steve jobs')) return "Eliminating clothing decisions preserves energy for important choices.";
  if (a.toLowerCase() === 'redirect') return "The core mindfulness skill is noticing wandering attention and redirecting it.";
  if (a.toLowerCase() === '5' && p.includes('mindfulness')) return "Even 5 minutes daily produces measurable cognitive and emotional benefits.";
  if (a.toLowerCase() === 'systems' && p.includes('goals set the direction')) return "Systems are daily processes moving you forward; goals only define the destination.";
  if (a.toLowerCase() === 'goals' && p.includes('winners')) return "Everyone wants to succeed. The difference is building systems that deliver.";
  if (a.toLowerCase() === 'gap') return "Identifying gaps between current state and desired state drives improvement.";
  if (a.toLowerCase() === 'action' && p.includes('plan')) return "Action plans convert insights into concrete steps with timelines.";
  if (a.toLowerCase() === 'discipline' && p.includes('equals freedom')) return "Discipline creates freedom from chaos, enabling achievement.";
  if (a.toLowerCase() === 'freedom' && p.includes('jocko')) return "Discipline provides freedom from chaos, procrastination, and regret.";
  if (a.toLowerCase() === 'can' && p.includes('serenity')) return "Accept what you cannot change, change what you can.";
  if (a.toLowerCase() === 'effort') return "Your effort and attitude are always within your control.";

  // Online Business fill gaps
  if (a.toLowerCase() === 'warehouses') return "Amazon fulfillment centers store inventory until customers order.";
  if (a.toLowerCase() === 'prime') return "Prime eligibility gives access to 200+ million members preferring fast shipping.";
  if (a.toLowerCase() === 'pod' && p.includes('printful')) return "These platforms handle printing, packing, and shipping for POD stores.";
  if (a.toLowerCase() === 'lower' && p.includes('pod profit')) return "Per-unit POD costs are higher than wholesale due to individual printing.";
  if (a.toLowerCase() === 'seasonal') return "Seasonal events create predictable demand spikes for relevant products.";
  if (a.toLowerCase() === 'research' && p.includes('niche')) return "Understanding your target audience is essential for creating products that sell.";
  if (a.toLowerCase() === 'competition') return "Manageable competition means enough demand but room for new entrants.";
  if (a.toLowerCase() === 'relationships') return "Health, wealth, and relationships address fundamental human needs consistently.";
  if (a.toLowerCase() === 'intent') return "High purchase intent means the searcher is actively looking to buy.";
  if (a.toLowerCase() === 'cons') return "Including cons builds credibility through honest, balanced evaluation.";
  if (a.toLowerCase() === 'portfolio') return "A portfolio provides concrete proof of your skills to potential clients.";
  if (a.toLowerCase() === 'commission' && p.includes('freelance platforms')) return "Platform commissions start around 20% and decrease as you build relationships.";
  if (a.toLowerCase() === 'efficiency') return "Faster work at the same project price means higher effective rates.";
  if (a.toLowerCase() === 'deposit') return "A deposit protects against non-payment and demonstrates client commitment.";
  if (a.toLowerCase() === 'topics') return "Content pillars ensure consistent messaging around core themes.";
  if (a.toLowerCase() === 'calendar' && p.includes('content')) return "Content calendars organize publishing for consistency and strategic planning.";
  if (a.toLowerCase() === 'fans') return "Kevin Kelly showed that a small dedicated audience can sustain a business.";
  if (a.toLowerCase() === 'sales' && p.includes('funnel')) return "Sales funnels systematically guide prospects from discovery to purchase.";
  if (a.toLowerCase() === '3' && p.includes('ltv')) return "A 3:1 ratio means each customer generates 3x more than acquisition cost.";
  if (a.toLowerCase() === '100' && p.includes('net revenue')) return "Over 100% NRR means existing customers spend more, driving organic growth.";
  if (a.toLowerCase() === 'upgrading') return "Expansion revenue from upgrades grows revenue without acquisition costs.";
  if (a.toLowerCase() === 'description' && p.includes('product')) return "Benefit-focused descriptions answer why customers should care.";
  if (a.toLowerCase() === 'proof') return "Social proof reduces purchase anxiety through evidence of satisfaction.";
  if (a.toLowerCase() === 'abandonment') return "Abandonment emails recover otherwise lost revenue from forgotten carts.";
  if (a.toLowerCase() === 'load') return "Each second of load delay reduces conversions significantly.";
  if (a.toLowerCase() === 'rules' && p.includes('platform')) return "Understanding platform rules prevents violations risking account suspension.";
  if (a.toLowerCase() === 'failure') return "Multi-platform presence ensures no single change eliminates your business.";
  if (a.toLowerCase() === 'status') return "Tracking status keeps teams aligned on content workflow progress.";
  if (a.toLowerCase() === 'days' && p.includes('batch-creating')) return "Designated creation days enable focused creative work.";
  if (a.toLowerCase() === 'questions' && p.includes('asking')) return "Questions prompt direct engagement, boosting comments and visibility.";
  if (a.toLowerCase() === 'algorithms') return "Algorithms prioritize high-engagement content in a feedback loop.";
  if (a.toLowerCase() === 'volume' && p.includes('search')) return "Search volume shows demand, helping prioritize content people seek.";
  if (a.toLowerCase() === 'intent' && p.includes('search')) return "Search intent ensures content matches what users expect to find.";
  if (a.toLowerCase() === 'tag' && p.includes('title')) return "The title tag is the most impactful on-page SEO element.";
  if (a.toLowerCase() === 'descriptions' && p.includes('meta')) return "Meta descriptions influence click-through rates from search results.";
  if (a.toLowerCase() === 'magnet') return "Lead magnets exchange valuable content for email addresses.";
  if (a.toLowerCase() === 'targeted') return "Segmented emails deliver relevant content to specific groups.";
  if (a.toLowerCase() === 'drip') return "Drip sequences deliver timed automated emails for lead nurturing.";
  if (a.toLowerCase() === '5-15') return "Even modest recovery rates from abandonment emails add significant revenue.";
  if (a.toLowerCase() === 'click' && p.includes('click-through')) return "CTR measures how many recipients took action on your email links.";
  if (a.toLowerCase() === 'engagement' && p.includes('removing inactive')) return "Removing inactive subscribers improves deliverability and metrics accuracy.";
  if (a.toLowerCase() === 'negative') return "Negative cash flow means spending more than earning, which is unsustainable.";
  if (a.toLowerCase() === 'forecast') return "Forecasting anticipates future shortfalls before they become crises.";
  if (a.toLowerCase() === 'goods') return "COGS includes direct costs of producing or purchasing products sold.";
  if (a.toLowerCase() === '10' && p.includes('profit margin')) return "10%+ net margin provides buffer for growth and unexpected expenses.";
  if (a.toLowerCase() === 'liability') return "Limited liability protects personal assets from business debts.";
  if (a.toLowerCase() === 'structure') return "Business structure affects taxes, liability, and fundraising ability.";
  if (a.toLowerCase() === 'tax' && p.includes('quarterly')) return "Self-employed must pay estimated taxes quarterly to avoid penalties.";
  if (a.toLowerCase() === 'finances') return "Mixing personal and business finances creates legal and tax problems.";
  if (a.toLowerCase() === 'contract') return "Contracts prevent scope creep and payment disputes.";
  if (a.toLowerCase() === 'agreement') return "NDAs legally protect confidential information shared between parties.";
  if (a.toLowerCase() === 'without you') return "Systems working independently enable scaling beyond personal capacity.";
  if (a.toLowerCase() === 'strengths') return "Scaling magnifies both strengths and weaknesses equally.";
  if (a.toLowerCase() === 'sops' && p.includes('document')) return "SOPs document procedures for consistent execution without supervision.";
  if (a.toLowerCase() === 'high-value') return "Delegation frees you for strategic activities that drive growth.";
  if (a.toLowerCase() === 'in' && p.includes('e-myth')) return "Working ON your business means building systems, not just doing daily tasks.";
  if (a.toLowerCase() === 'apps' && p.includes('zapier')) return "Automation tools connect different apps to eliminate manual data work.";
  if (a.toLowerCase() === 'authority' && p.includes('blockchain')) return "Decentralization removes the need for trusted intermediaries like banks.";
  if (a.toLowerCase() === 'identity' && p.includes('blockchain')) return "Digital identity on blockchain provides secure, verifiable credentials.";
  if (a.toLowerCase() === 'lose' && p.includes('cryptocurrency')) return "Only invest what you can afford to lose given extreme crypto volatility.";
  if (a.toLowerCase() === 'coins') return "Self-custody means you control your private keys and your cryptocurrency.";
  if (a.toLowerCase() === 'blockchain' && p.includes('web3')) return "Web3 uses blockchain for decentralized apps where users control their data.";
  if (a.toLowerCase() === 'control' && p.includes('web3')) return "Web3 shifts ownership from platforms to users through decentralization.";
  if (a.toLowerCase() === 'action' && p.includes('funnel stages')) return "AIDA describes the customer journey from awareness through to purchase.";
  if (a.toLowerCase() === 'stage') return "Small improvements at each stage multiply for significant overall gains.";
  if (a.toLowerCase() === 'action' && p.includes('aida')) return "AIDA guides structure: Attention, Interest, Desire, then Action.";
  if (a.toLowerCase() === 'emotions') return "Emotional copy drives action because people decide emotionally first.";
  if (a.toLowerCase() === 'one' && p.includes('bounce')) return "High bounce rate indicates content or UX problems driving visitors away.";
  if (a.toLowerCase() === 'versions') return "A/B testing compares versions to determine which performs better.";
  if (a.toLowerCase() === 'guide' && p.includes('brand')) return "Brand guides ensure consistency across all touchpoints.";
  if (a.toLowerCase() === 'voice' && p.includes('brand')) return "Brand voice creates personality building emotional audience connection.";
  if (a.toLowerCase() === 'value' && p.includes('outsourcing')) return "Outsourcing routine work frees time for strategic growth activities.";
  if (a.toLowerCase() === 'trial') return "Trial projects test quality and reliability before ongoing commitment.";
  if (a.toLowerCase() === 'lifetime') return "CLV measures total expected revenue guiding acquisition spend.";
  if (a.toLowerCase() === 'satisfaction') return "Satisfaction surveys catch problems before customers leave.";
  if (a.toLowerCase() === 'sequence' && p.includes('launch')) return "Launch sequences build excitement through timed content releases.";
  if (a.toLowerCase() === 'content' && p.includes('post-launch')) return "Post-launch content sustains sales after initial excitement fades.";
  if (a.toLowerCase() === 'systems' && p.includes('building')) return "Systems working independently free you from trading time for money.";
  if (a.toLowerCase() === 'passive') return "Passive income flows from automated systems and digital assets.";

  // Generic fallback
  return "The correct answer accurately completes the concept described in the question.";
}

// ==================== MULTIPLE CHOICE ====================
// Due to extreme length, MC uses a more concise approach
function getMC(p, a) {
  // Build explanation from the correct answer and question context
  // Keep it 1-2 sentences, educational

  // Clean answer for use in explanation
  const cleanA = a.replace(/"/g, '').substring(0, 100);

  // If the answer is long/self-explanatory, extract the key insight
  if (a.length > 80) {
    const parts = a.split(' — ');
    if (parts.length > 1) return parts[1].substring(0, 150);
    const dashParts = a.split(' - ');
    if (dashParts.length > 1) return dashParts[1].substring(0, 150);
  }

  // Try to build from question context
  if (p.includes('what is') || p.includes('what does') || p.includes('what are')) {
    return cleanA + " is the correct definition, reflecting established terminology in this field.";
  }
  if (p.includes('why') || p.includes('how does') || p.includes('how can') || p.includes('how do')) {
    return cleanA + " because this approach is supported by research and proven results.";
  }
  if (p.includes('which') || p.includes('what should') || p.includes('when should') || p.includes('when is')) {
    return cleanA + " is the recommended approach based on industry best practices.";
  }
  if (p.includes('best') || p.includes('most')) {
    return cleanA + " delivers the best results according to expert consensus and data.";
  }

  return cleanA + " is correct because it most accurately addresses what the question asks.";
}

// Process the three files
const files = [
  '/Users/oli/Desktop/SkillForge/src/utils/questions/ai-tools.ts',
  '/Users/oli/Desktop/SkillForge/src/utils/questions/discipline.ts',
  '/Users/oli/Desktop/SkillForge/src/utils/questions/online-business.ts'
];

for (const f of files) {
  processFile(f);
}
