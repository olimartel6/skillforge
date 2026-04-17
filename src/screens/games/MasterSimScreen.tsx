import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

// --- Scenario Types ---
interface Choice {
  text: string;
  effects: Record<string, number>;
  feedback: string;
}

interface Scenario {
  title: string;
  description: string;
  category: string;
  choices: Choice[];
}

interface SimConfig {
  title: string;
  icon: string;
  subtitle: string;
  metrics: { key: string; label: string; icon: string; target?: number; format?: string }[];
  winCondition: (metrics: Record<string, number>) => boolean;
  winText: string;
  loseText: string;
  totalRounds: number;
  scenarios: Scenario[];
}

interface DecisionRecord {
  round: number;
  scenarioTitle: string;
  category: string;
  choiceText: string;
  feedback: string;
  scoreImpact: number;
  timestamp: number;
}

// --- Skill Configs ---
const SALES_SIM: SimConfig = {
  title: 'Master Closer',
  icon: '🤝',
  subtitle: 'Close 3 deals out of 5 prospects',
  metrics: [
    { key: 'deals', label: 'Deals Closed', icon: '✅', target: 3 },
    { key: 'revenue', label: 'Revenue', icon: '💰', format: '$' },
    { key: 'trust', label: 'Trust Score', icon: '🤝' },
    { key: 'reputation', label: 'Reputation', icon: '⭐' },
  ],
  winCondition: (m) => m.deals >= 3,
  winText: 'Master Closer! You closed 3+ deals!',
  loseText: "You didn't close enough deals",
  totalRounds: 15,
  scenarios: [
    // --- COLD CALLING ---
    { title: '🔔 Cold Call', category: 'Cold Calling', description: 'A business owner picks up. They seem busy. How do you open?', choices: [
      { text: '"Hi, I\'m selling marketing services..."', effects: { trust: -10, reputation: -5 }, feedback: 'Too direct. They hung up.' },
      { text: '"I noticed your website could get more leads. Got 30 seconds?"', effects: { trust: 15, reputation: 5 }, feedback: 'Great hook! They\'re listening.' },
      { text: '"Can I speak to the decision maker?"', effects: { trust: -5, reputation: -3 }, feedback: 'Feels like a telemarketer.' },
      { text: '"I helped a business like yours 3x their leads last month."', effects: { trust: 20, reputation: 8 }, feedback: 'Social proof works! They want to hear more.' },
    ]},
    { title: '📞 Second Cold Call', category: 'Cold Calling', description: 'You call a restaurant owner. She answers: "I\'m in the middle of lunch rush." What do you do?', choices: [
      { text: '"This will only take a minute—"', effects: { trust: -15, reputation: -8 }, feedback: 'Disrespecting her time. Instant hang-up.' },
      { text: '"Bad timing! When\'s best to call back? I have a way to fill your empty tables."', effects: { trust: 20, reputation: 10 }, feedback: 'Respectful + curiosity hook. She gives you a time.' },
      { text: 'Hang up and never call back.', effects: { trust: -5, reputation: -2 }, feedback: 'You gave up too easily.' },
      { text: '"Quick question: are your Tuesday and Wednesday nights full?"', effects: { trust: 10, reputation: 5 }, feedback: 'Decent—shows you know restaurant pain points.' },
    ]},
    { title: '📱 Voicemail Game', category: 'Cold Calling', description: 'You hit voicemail on a high-value prospect. What do you leave?', choices: [
      { text: 'A 2-minute pitch about your company history.', effects: { trust: -15, reputation: -5 }, feedback: 'Deleted after 10 seconds.' },
      { text: '"Hey [Name], quick 18-second message. I found 3 things on your site that are costing you leads. Call me at..."', effects: { trust: 20, reputation: 10 }, feedback: 'Short, specific, curiosity-driven. They call back!' },
      { text: 'Don\'t leave a voicemail. Send an email instead.', effects: { trust: 5, reputation: 2 }, feedback: 'Emails are easier to ignore than voicemails.' },
      { text: '"Hi, this is [Name] from [Company], please call me back."', effects: { trust: -10, reputation: -3 }, feedback: 'No reason to call back. Ignored.' },
    ]},
    { title: '🚪 Cold Walk-In', category: 'Cold Calling', description: 'You walk into a local gym to pitch your software. The owner looks annoyed. First words?', choices: [
      { text: '"I sell gym management software—"', effects: { trust: -10, reputation: -5 }, feedback: 'He points to the door.' },
      { text: '"Nice gym! Quick question—do you lose members in January after the New Year rush?"', effects: { trust: 20, reputation: 10 }, feedback: 'Compliment + pain question. He stops and listens.' },
      { text: '"I have a presentation I\'d love to show you."', effects: { trust: -8, reputation: -3 }, feedback: '"Not interested." You\'re out.' },
      { text: '"One of the gyms down the street cut member churn by 40%. Curious how?"', effects: { trust: 15, reputation: 8 }, feedback: 'Competitive FOMO. He\'s interested.' },
    ]},
    // --- DISCOVERY ---
    { title: '🔍 Discovery', category: 'Discovery', description: 'The prospect is interested. What do you ask first?', choices: [
      { text: '"What\'s your current monthly revenue?"', effects: { trust: -5, reputation: -3 }, feedback: 'Too personal too fast.' },
      { text: '"What\'s your biggest challenge with getting new customers?"', effects: { trust: 20, reputation: 8 }, feedback: 'Perfect discovery question!' },
      { text: '"Do you have a budget for marketing?"', effects: { trust: -10, reputation: -5 }, feedback: 'Budget talk too early kills trust.' },
      { text: '"Tell me about your business goals for this year."', effects: { trust: 15, reputation: 5 }, feedback: 'Good! Shows you care about their goals.' },
    ]},
    { title: '🎯 Deep Discovery', category: 'Discovery', description: 'The prospect says "We need more leads." How do you dig deeper?', choices: [
      { text: '"Great, we can do that! Let me show you our packages."', effects: { trust: -15, reputation: -5 }, feedback: 'You skipped discovery entirely. Amateur move.' },
      { text: '"When you say more leads—what kind? And what happens to them after they come in?"', effects: { trust: 25, reputation: 12 }, feedback: 'Gold-standard follow-up. You uncovered they have a conversion problem, not a lead problem.' },
      { text: '"How many leads do you get per month now?"', effects: { trust: 10, reputation: 5 }, feedback: 'Good data question but doesn\'t go deep enough.' },
      { text: '"What have you tried so far?"', effects: { trust: 15, reputation: 6 }, feedback: 'Solid. Understanding past attempts prevents repeating failures.' },
    ]},
    // --- OBJECTION HANDLING ---
    { title: '💰 Price Objection', category: 'Objection Handling', description: '"That\'s too expensive for us right now." How do you respond?', choices: [
      { text: '"I can give you a discount."', effects: { trust: -15, revenue: -500, reputation: -10 }, feedback: 'Never drop price first! Lost value.' },
      { text: '"Compared to what? What\'s it costing you NOT to fix this?"', effects: { trust: 15, reputation: 8 }, feedback: 'Reframing the cost — great technique!' },
      { text: '"That\'s the best price we offer."', effects: { trust: -10, reputation: -5 }, feedback: 'Rigid response loses the deal.' },
      { text: '"If we could show ROI in 30 days, would the investment make sense?"', effects: { trust: 25, reputation: 12 }, feedback: 'Tying price to results — master move!' },
    ]},
    { title: '🤔 "Let me think about it"', category: 'Objection Handling', description: 'The prospect says they need to think. What do you do?', choices: [
      { text: '"Sure, take your time!"', effects: { trust: -20, reputation: -8 }, feedback: 'You just lost them forever.' },
      { text: '"What specifically do you need to think about?"', effects: { trust: 20, reputation: 10 }, feedback: 'Uncovering the real objection!' },
      { text: '"The price goes up next week."', effects: { trust: -10, reputation: -8 }, feedback: 'Fake urgency damages trust.' },
      { text: '"If I address your concerns now, could we move forward today?"', effects: { trust: 15, reputation: 5 }, feedback: 'Good assumptive close attempt!' },
    ]},
    { title: '📧 "Send me an email"', category: 'Objection Handling', description: 'Prospect cuts you off: "Just send me an email." This is a brush-off. React?', choices: [
      { text: '"Sure, what\'s your email?" and hang up.', effects: { trust: -15, reputation: -5 }, feedback: 'You fell for it. That email goes to trash.' },
      { text: '"Happy to! So I send the right info—what\'s your biggest priority right now?"', effects: { trust: 20, reputation: 10 }, feedback: 'Turned a brush-off into a discovery question. Pro move!' },
      { text: '"I\'d rather just tell you now—"', effects: { trust: -10, reputation: -8 }, feedback: 'Pushy. They\'re done with you.' },
      { text: '"Absolutely. I\'ll include a case study from [similar company]. If it resonates, worth a 10-min chat?"', effects: { trust: 15, reputation: 8 }, feedback: 'Gave a reason to open the email AND set the next step.' },
    ]},
    { title: '🛡️ "We use a competitor"', category: 'Objection Handling', description: '"We already work with [Agency X]." What do you say?', choices: [
      { text: '"We\'re better than them."', effects: { trust: -20, reputation: -12 }, feedback: 'Never trash competitors.' },
      { text: '"That\'s great! What do you wish they did better?"', effects: { trust: 25, reputation: 10 }, feedback: 'Finding gaps in the competition — perfect!' },
      { text: '"How long have you been with them?"', effects: { trust: 10, reputation: 3 }, feedback: 'OK question but not impactful.' },
      { text: '"Would it make sense to compare results side by side?"', effects: { trust: 15, reputation: 8 }, feedback: 'Audit approach — shows confidence!' },
    ]},
    { title: '⏳ "Not the right time"', category: 'Objection Handling', description: '"We\'re too busy right now, maybe next quarter." What do you say?', choices: [
      { text: '"OK, I\'ll call you in 3 months."', effects: { trust: -10, reputation: -3 }, feedback: 'They won\'t remember you in 3 months.' },
      { text: '"Totally understand. What if I set everything up so it takes zero effort from your side?"', effects: { trust: 20, reputation: 10 }, feedback: 'Removed the objection entirely!' },
      { text: '"The busy season is exactly when you need this most—"', effects: { trust: -5, reputation: -3 }, feedback: 'Logical but feels dismissive of their concern.' },
      { text: '"Got it. Can I send you a 2-min video showing the ROI? If it makes sense, we chat. If not, no worries."', effects: { trust: 15, reputation: 8 }, feedback: 'Low-commitment next step. Smart.' },
    ]},
    // --- CLOSING ---
    { title: '📝 The Close', category: 'Closing', description: 'Trust is high, they\'re nodding. Time to close. How?', choices: [
      { text: '"So... would you like to buy?"', effects: { trust: -5, reputation: -3 }, feedback: 'Weak close. Be more confident.' },
      { text: '"Based on what you told me, the Pro plan solves all 3 problems. Should we start Monday?"', effects: { trust: 20, deals: 1, revenue: 2000, reputation: 10 }, feedback: 'Summary close + assumptive close = deal!' },
      { text: '"I\'ll send you a proposal."', effects: { trust: -10, reputation: -5 }, feedback: 'Proposals delay deals. Close now.' },
      { text: '"Would you prefer the monthly or annual plan?"', effects: { trust: 15, deals: 1, revenue: 1500, reputation: 8 }, feedback: 'Alternative close works! Deal closed.' },
    ]},
    { title: '⚡ Speed Close', category: 'Closing', description: 'Hot lead from a referral. They\'re ready. What do you do?', choices: [
      { text: 'Run through your full 30-min pitch.', effects: { trust: -10, reputation: -5 }, feedback: 'Overtalking kills hot leads.' },
      { text: '"[Referrer] told me you need X. Here\'s how we solve it. Start this week?"', effects: { trust: 25, deals: 1, revenue: 2500, reputation: 12 }, feedback: 'Fast, direct, referral-powered. Closed!' },
      { text: '"Let me send you our brochure first."', effects: { trust: -20, reputation: -10 }, feedback: 'You just cooled down a hot lead.' },
      { text: '"What questions do you have? Let me address them now."', effects: { trust: 15, reputation: 5 }, feedback: 'Good but could be more decisive.' },
    ]},
    { title: '🏁 Final Push', category: 'Closing', description: 'End of month. Need 1 more deal. Warm lead on the fence. What do you do?', choices: [
      { text: '"This is the last day for our current pricing."', effects: { trust: 5, reputation: 2 }, feedback: 'Real urgency can work. They consider it.' },
      { text: '"Let me build a custom ROI projection for your business. 10 min call?"', effects: { trust: 20, deals: 1, revenue: 3000, reputation: 10 }, feedback: 'Personalized value. They commit!' },
      { text: '"Just wanted to follow up again..."', effects: { trust: -15, reputation: -8 }, feedback: '7th follow-up with no value = blocked.' },
      { text: '"I have a client in your exact space. Want an intro to see their results?"', effects: { trust: 15, deals: 1, revenue: 2000, reputation: 8 }, feedback: 'Social proof with intro offer. Closed!' },
    ]},
    { title: '💎 The Trial Close', category: 'Closing', description: 'Midway through your demo, the prospect says "This looks great." Do you keep presenting or close?', choices: [
      { text: 'Keep presenting — you have 10 more slides.', effects: { trust: -10, reputation: -5 }, feedback: 'You talked past the close. They cooled off.' },
      { text: '"Glad you like it! Want to get started today and I\'ll walk you through the rest live?"', effects: { trust: 25, deals: 1, revenue: 2000, reputation: 12 }, feedback: 'Trial close at the buying signal — masterful!' },
      { text: '"Great! Let me show you even more features—"', effects: { trust: -5, reputation: -3 }, feedback: 'Feature dumping after interest kills momentum.' },
      { text: '"What would need to be true for you to move forward?"', effects: { trust: 15, reputation: 8 }, feedback: 'Good qualifying question but you could have closed.' },
    ]},
    // --- NEGOTIATION ---
    { title: '📊 Negotiation', category: 'Negotiation', description: 'They want 30% off your $3K package. Respond.', choices: [
      { text: '"Best I can do is 20% off."', effects: { trust: -5, revenue: -600, reputation: -3 }, feedback: 'You just anchored to a discount.' },
      { text: '"I can\'t lower the price, but I can add [bonus service] worth $500."', effects: { trust: 20, revenue: 500, reputation: 10 }, feedback: 'Added value without cutting price!' },
      { text: '"Sorry, the price is firm."', effects: { trust: -10, reputation: -5 }, feedback: 'Too rigid — lost the deal.' },
      { text: '"If you commit to 6 months, I\'ll include month 1 free."', effects: { trust: 15, deals: 1, revenue: 2500, reputation: 8 }, feedback: 'Win-win. Long-term commitment closed!' },
    ]},
    { title: '🏷️ Competitor Undercut', category: 'Negotiation', description: '"Your competitor quoted us 40% less." How do you handle it?', choices: [
      { text: '"We\'ll match their price."', effects: { trust: -10, revenue: -1200, reputation: -8 }, feedback: 'Price matching destroys your positioning.' },
      { text: '"I\'d be concerned about that price. Let me show you what\'s included in ours vs theirs."', effects: { trust: 25, reputation: 12 }, feedback: 'Reframing value over price — expert move!' },
      { text: '"You get what you pay for."', effects: { trust: -15, reputation: -10 }, feedback: 'Condescending. They go with the competitor.' },
      { text: '"What matters more to you—lowest price or best results? Because our clients get [specific result]."', effects: { trust: 20, reputation: 10 }, feedback: 'Shifted the conversation from price to outcomes.' },
    ]},
    // --- FOLLOW-UP & RELATIONSHIP ---
    { title: '📧 Follow-Up Email', category: 'Follow-Up', description: 'A warm lead hasn\'t replied in 3 days. What do you send?', choices: [
      { text: '"Just checking in..."', effects: { trust: -10, reputation: -5 }, feedback: 'Generic follow-up gets ignored.' },
      { text: '"I found a case study from your industry — 4x ROI in 60 days"', effects: { trust: 20, reputation: 10 }, feedback: 'Value-first follow-up! They respond.' },
      { text: '"Are you still interested?"', effects: { trust: -15, reputation: -8 }, feedback: 'Desperate energy. They ghost you.' },
      { text: '"Saw [competitor] just launched X. Thought you\'d want to stay ahead."', effects: { trust: 15, reputation: 8 }, feedback: 'Competitive urgency — smart!' },
    ]},
    { title: '👥 Gatekeeper', category: 'Cold Calling', description: 'The receptionist says "He\'s in a meeting." What do you do?', choices: [
      { text: '"I\'ll call back later."', effects: { trust: 0, reputation: 0 }, feedback: 'You\'ll never reach them this way.' },
      { text: '"It\'s regarding the marketing initiative he inquired about."', effects: { trust: 10, reputation: 5 }, feedback: 'Creates curiosity. Gets transferred.' },
      { text: '"Can you give me his email?"', effects: { trust: 5, reputation: 2 }, feedback: 'OK but low conversion.' },
      { text: '"When\'s the best time to reach him? I\'ll block 5 minutes."', effects: { trust: 15, reputation: 8 }, feedback: 'Professional and persistent!' },
    ]},
    { title: '🎯 Upsell', category: 'Closing', description: 'Client on $1K plan is happy. How do you upsell?', choices: [
      { text: '"Want to upgrade to our premium plan?"', effects: { trust: -5, reputation: -3 }, feedback: 'No reason given. Why would they?' },
      { text: '"Your results are great. With our Pro tier, I can 2x these numbers."', effects: { trust: 20, deals: 1, revenue: 2000, reputation: 10 }, feedback: 'Data-driven upsell — they upgrade!' },
      { text: '"We\'re raising prices next month."', effects: { trust: -15, reputation: -10 }, feedback: 'Threatening existing clients is bad.' },
      { text: '"I noticed 3 growth opportunities we\'re not capturing. Can I show you?"', effects: { trust: 15, revenue: 1000, reputation: 8 }, feedback: 'Consultative approach — they see the value.' },
    ]},
    { title: '🔥 Referral Ask', category: 'Follow-Up', description: 'Happy client. Perfect time to ask for referrals. How?', choices: [
      { text: '"Know anyone who might need this?"', effects: { trust: 5, reputation: 2 }, feedback: 'Too vague. They say "I\'ll think about it."' },
      { text: '"Who are 2 business owners in your network struggling with [problem]?"', effects: { trust: 20, reputation: 12 }, feedback: 'Specific ask = specific referrals. Got 2 names!' },
      { text: '"Can you post about us on LinkedIn?"', effects: { trust: -5, reputation: -3 }, feedback: 'Too much to ask right now.' },
      { text: '"We have a referral bonus — $200 per intro."', effects: { trust: 10, reputation: 5 }, feedback: 'Incentive helps but feels transactional.' },
    ]},
    { title: '💬 Demo Day', category: 'Closing', description: 'Group demo with 5 decision makers. Opening slide. What do you lead with?', choices: [
      { text: 'Company history and team bios.', effects: { trust: -15, reputation: -8 }, feedback: 'Nobody cares about your story yet.' },
      { text: '"In the next 20 minutes, I\'ll show you how to cut ad spend by 40%."', effects: { trust: 25, reputation: 12 }, feedback: 'Promise of value — everyone\'s locked in!' },
      { text: 'Feature list and pricing tiers.', effects: { trust: -10, reputation: -5 }, feedback: 'Features bore. Benefits sell.' },
      { text: '"Before I start — what\'s the #1 thing you need to see today?"', effects: { trust: 20, reputation: 10 }, feedback: 'Audience-first approach. Smart!' },
    ]},
    { title: '🎯 Re-engagement', category: 'Follow-Up', description: 'Old lead from 3 months ago. They said "not now." Re-approach?', choices: [
      { text: '"Circling back on our previous conversation..."', effects: { trust: -10, reputation: -5 }, feedback: 'Cookie-cutter email. Ignored.' },
      { text: '"Since we last spoke, we helped [similar company] achieve X. Worth a 5-min chat?"', effects: { trust: 20, reputation: 10 }, feedback: 'New results + low ask. They respond!' },
      { text: '"Ready to start now?"', effects: { trust: -15, reputation: -8 }, feedback: 'Pushy. Not how re-engagement works.' },
      { text: '"Saw your company just [recent news]. Congrats! This might be relevant..."', effects: { trust: 15, reputation: 8 }, feedback: 'Personalized + timely. Great re-engagement!' },
    ]},
    { title: '😤 Angry Prospect', category: 'Objection Handling', description: 'A prospect you called is furious: "Stop calling me! I said NO last week!" What do you do?', choices: [
      { text: '"I apologize, but hear me out—"', effects: { trust: -20, reputation: -15 }, feedback: 'You ignored their boundary. Reported for spam.' },
      { text: '"You\'re right, I\'m sorry. Removing you from our list right now. If things change, I\'m here."', effects: { trust: 10, reputation: 15 }, feedback: 'Respectful exit. Surprisingly, they call back 2 months later.' },
      { text: 'Hang up immediately without saying anything.', effects: { trust: -5, reputation: -5 }, feedback: 'Rude. No chance of recovery.' },
      { text: '"My apologies for the duplicate call. Before I go — we just helped [company in their space] with [result]. Just in case."', effects: { trust: 5, reputation: 8 }, feedback: 'Respectful but planted a seed. Risky but can work.' },
    ]},
  ],
};

const BUSINESS_SIM: SimConfig = {
  title: 'Master CEO',
  icon: '👔',
  subtitle: 'Grow your startup to $100K revenue',
  metrics: [
    { key: 'revenue', label: 'Revenue', icon: '💰', target: 100000, format: '$' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'cash', label: 'Cash', icon: '🏦', format: '$' },
    { key: 'morale', label: 'Team', icon: '💪' },
    { key: 'reputation', label: 'Reputation', icon: '⭐' },
  ],
  winCondition: (m) => m.revenue >= 100000,
  winText: 'Master CEO! $100K revenue reached!',
  loseText: "Your startup didn't hit the target",
  totalRounds: 15,
  scenarios: [
    // --- STARTUP DECISIONS ---
    { title: '🚀 Launch Day', category: 'Startup', description: 'Your MVP is ready. $50K in the bank. How do you launch?', choices: [
      { text: 'Spend $20K on Facebook ads', effects: { cash: -20000, users: 500, revenue: 5000, reputation: 3 }, feedback: 'Ads bring users but burn cash fast.' },
      { text: 'Launch on Product Hunt + Hacker News', effects: { users: 2000, revenue: 8000, reputation: 15 }, feedback: 'Free launch channels! Huge initial traction.' },
      { text: 'Hire a PR agency for $15K', effects: { cash: -15000, users: 300, revenue: 3000, reputation: 5 }, feedback: 'PR is slow for startups. Money wasted.' },
      { text: 'Cold email 500 potential customers', effects: { users: 150, revenue: 12000, reputation: 8 }, feedback: 'Direct sales = highest quality customers!' },
    ]},
    { title: '🏗️ Bootstrap vs Raise', category: 'Startup', description: 'Month 2. Product is working but growth is slow. An angel investor offers $150K for 15%. Do you take it?', choices: [
      { text: 'Take the angel money — growth matters more than equity.', effects: { cash: 150000, morale: 10, reputation: 5 }, feedback: 'Cash runway extended. But 15% is a lot this early.' },
      { text: 'Decline. Get 3 paying clients instead.', effects: { revenue: 18000, morale: 15, reputation: 10 }, feedback: 'Revenue > funding. Bootstrapper mindset wins.' },
      { text: 'Counter-offer: $100K for 8% as a convertible note.', effects: { cash: 100000, morale: 10, reputation: 12 }, feedback: 'Smart negotiation. Investor respects the pushback.' },
      { text: 'Take a bank loan of $50K instead.', effects: { cash: 50000, morale: -5 }, feedback: 'Debt without revenue is stressful.' },
    ]},
    { title: '🛠️ Build vs Buy', category: 'Startup', description: 'You need a payment system. Build custom or use Stripe?', choices: [
      { text: 'Build a custom payment system from scratch.', effects: { cash: -15000, morale: -10 }, feedback: '3 months wasted. Stripe does this in 2 hours.' },
      { text: 'Use Stripe and focus on your core product.', effects: { cash: -500, revenue: 8000, morale: 10, reputation: 5 }, feedback: 'Smart! Ship fast, iterate later.' },
      { text: 'Ask users to wire money directly.', effects: { users: -200, reputation: -10 }, feedback: 'Nobody trusts wire transfers to startups.' },
      { text: 'Offer a free tier first, add payments later.', effects: { users: 1000, morale: 5 }, feedback: 'Users grow but zero revenue. Risky.' },
    ]},
    // --- CASH FLOW CRISES ---
    { title: '💰 Pricing', category: 'Cash Flow', description: 'Users love the free tier but won\'t upgrade. What do you do?', choices: [
      { text: 'Remove the free tier entirely', effects: { users: -500, revenue: 15000, reputation: -5 }, feedback: 'Bold. Lost users but paying ones stay.' },
      { text: 'Add a usage limit to free tier', effects: { users: -100, revenue: 20000, reputation: 5 }, feedback: 'Smart! Free users hit the wall and convert.' },
      { text: 'Lower the paid price by 50%', effects: { revenue: 5000, reputation: -3 }, feedback: 'Cheap pricing attracts cheap customers.' },
      { text: 'Add premium features that free users can see but not use', effects: { users: 200, revenue: 18000, reputation: 8 }, feedback: 'FOMO works! Conversions increase.' },
    ]},
    { title: '🔴 Payroll Crisis', category: 'Cash Flow', description: 'Payroll is due Friday. Your biggest client hasn\'t paid their $25K invoice (60 days late). $8K in the bank. What do you do?', choices: [
      { text: 'Call the client and demand payment today.', effects: { cash: 15000, morale: -10, reputation: -8 }, feedback: 'They pay partially but the relationship is damaged.' },
      { text: 'Use a factoring service to get 80% of the invoice now.', effects: { cash: 20000, morale: 5, reputation: 3 }, feedback: 'Lost 20% but met payroll. Team doesn\'t even know.' },
      { text: 'Ask your team to delay paychecks by a week.', effects: { morale: -25, reputation: -15 }, feedback: 'Trust destroyed. Two people start job hunting.' },
      { text: 'Take a short-term line of credit and send a polite but firm collection notice.', effects: { cash: 25000, morale: 5, reputation: 5 }, feedback: 'Professional handling. Client pays next week.' },
    ]},
    { title: '📉 Churn Spike', category: 'Cash Flow', description: 'MRR dropped 20% this month. 15 customers cancelled. React?', choices: [
      { text: 'Panic. Offer everyone a 50% discount.', effects: { revenue: -8000, reputation: -5 }, feedback: 'Discounts don\'t fix churn. They make it worse.' },
      { text: 'Call every churned customer. Ask why. Fix the top 3 issues.', effects: { revenue: 10000, users: 100, morale: 10, reputation: 10 }, feedback: 'Customer development at its finest. Found and fixed root causes.' },
      { text: 'Focus on acquiring new customers to replace the churned ones.', effects: { cash: -5000, users: 200, revenue: 3000 }, feedback: 'Leaky bucket. New users will churn too.' },
      { text: 'Ship 5 new features to make the product stickier.', effects: { cash: -8000, morale: -5 }, feedback: 'Features without understanding the problem = waste.' },
    ]},
    // --- GROWTH DECISIONS ---
    { title: '🎯 Growth Channel', category: 'Growth', description: 'You have $10K marketing budget. Where do you invest?', choices: [
      { text: 'Google Ads targeting buyer-intent keywords', effects: { cash: -10000, users: 800, revenue: 20000, reputation: 5 }, feedback: 'High intent = high conversion. Great ROI!' },
      { text: 'Sponsor 10 newsletters in your niche', effects: { cash: -10000, users: 1500, revenue: 12000, reputation: 8 }, feedback: 'Good reach but lower conversion.' },
      { text: 'Hire an influencer for a video', effects: { cash: -10000, users: 3000, revenue: 5000, reputation: 3 }, feedback: 'Lots of vanity metrics, few buyers.' },
      { text: 'Build a referral program for existing users', effects: { cash: -2000, users: 1000, revenue: 15000, reputation: 12 }, feedback: 'Cheapest and most sustainable growth!' },
    ]},
    { title: '🌎 New Market vs Deepen', category: 'Growth', description: 'You own 5% of the US market. A partner offers to launch you in Europe. Do you expand or deepen?', choices: [
      { text: 'Go to Europe. First-mover advantage!', effects: { cash: -20000, users: 500, revenue: 5000, reputation: 5 }, feedback: 'Expensive. Different regulations. Distracted the team.' },
      { text: 'Stay focused. Go from 5% to 15% in the US first.', effects: { revenue: 25000, users: 800, morale: 10, reputation: 10 }, feedback: 'Dominate before you expand. Revenue triples.' },
      { text: 'Test Europe with a small pilot — $5K budget.', effects: { cash: -5000, users: 200, revenue: 8000, reputation: 8 }, feedback: 'Smart test. Data will tell you if it\'s worth scaling.' },
      { text: 'License your product to the European partner for royalties.', effects: { revenue: 12000, reputation: 10 }, feedback: 'Zero risk expansion. Revenue with no effort.' },
    ]},
    { title: '📈 Scaling', category: 'Growth', description: 'Revenue is growing 20%/month. What\'s the priority?', choices: [
      { text: 'Hire aggressively — 5 new people', effects: { cash: -25000, morale: -10, reputation: -3 }, feedback: 'Too fast. Culture suffers.' },
      { text: 'Invest in systems and automation', effects: { cash: -5000, revenue: 15000, morale: 10, reputation: 8 }, feedback: 'Scalable foundation. Smart!' },
      { text: 'Raise prices 30%', effects: { users: -200, revenue: 20000, reputation: 5 }, feedback: 'Less users but much more revenue per user.' },
      { text: 'Expand to a new market segment', effects: { cash: -8000, users: 800, revenue: 18000, reputation: 10 }, feedback: 'New segment = new revenue stream!' },
    ]},
    { title: '🔥 Viral Moment', category: 'Growth', description: 'A tweet about your product goes viral. 50K views. What do you do?', choices: [
      { text: 'Nothing — let it ride', effects: { users: 1000 }, feedback: 'Missed the moment.' },
      { text: 'Reply to every comment + offer a special deal', effects: { users: 3000, revenue: 15000, reputation: 10 }, feedback: 'Engagement + conversion. Masterful!' },
      { text: 'Boost the tweet with $5K in ads', effects: { cash: -5000, users: 5000, revenue: 8000, reputation: 5 }, feedback: 'Amplified but organic was already working.' },
      { text: 'Create a landing page for the viral audience + limited offer', effects: { users: 4000, revenue: 25000, reputation: 12 }, feedback: 'Captured the moment perfectly!' },
    ]},
    // --- TEAM MANAGEMENT ---
    { title: '👥 First Hire', category: 'Team', description: 'You need help. Who do you hire first?', choices: [
      { text: 'A salesperson ($5K/mo)', effects: { cash: -5000, revenue: 15000, reputation: 5 }, feedback: 'Revenue goes up immediately!' },
      { text: 'A developer ($8K/mo)', effects: { cash: -8000, users: 500 }, feedback: 'Better product but no immediate revenue.' },
      { text: 'A marketing intern ($1K/mo)', effects: { cash: -1000, users: 200, revenue: 3000 }, feedback: 'Cheap but limited impact.' },
      { text: 'A VA for operations ($500/mo)', effects: { cash: -500, morale: 20 }, feedback: 'Frees your time but no growth.' },
    ]},
    { title: '👤 Co-founder Conflict', category: 'Team', description: 'Your co-founder wants to pivot the product. You disagree.', choices: [
      { text: 'Agree to keep the peace', effects: { morale: -20, revenue: -5000, reputation: -5 }, feedback: 'Conflict avoided but direction lost.' },
      { text: 'Let data decide — run a 2-week test', effects: { morale: 15, revenue: 5000, reputation: 10 }, feedback: 'Data-driven decisions! Conflict resolved.' },
      { text: 'Buy them out', effects: { cash: -30000, morale: -10, reputation: -5 }, feedback: 'Expensive but full control.' },
      { text: 'Split test both visions with users', effects: { morale: 10, users: 300, revenue: 8000, reputation: 8 }, feedback: 'Both ideas tested. Best one wins.' },
    ]},
    { title: '⭐ Star Performer Leaving', category: 'Team', description: 'Your best developer got an offer from Google. 50% raise. She tells you Friday is her last day.', choices: [
      { text: 'Match Google\'s salary.', effects: { cash: -15000, morale: 10, reputation: 5 }, feedback: 'She stays but it strains your budget. Other team members will want raises too.' },
      { text: 'Offer equity (2%) + a leadership title + flexible hours.', effects: { morale: 20, reputation: 12 }, feedback: 'She stays! Ownership + purpose > salary at a big corp.' },
      { text: 'Let her go. No one is irreplaceable.', effects: { morale: -15, users: -200, reputation: -8 }, feedback: 'Product quality drops. 2 others follow her out.' },
      { text: 'Ask what she really wants. Listen first.', effects: { morale: 15, reputation: 10 }, feedback: 'She wanted more ownership of technical decisions. Easy fix. She stays.' },
    ]},
    { title: '😤 Employee Conflict', category: 'Team', description: 'Your designer and developer are in a heated argument. The designer says the developer ignores all UX specs. The developer says specs are unrealistic. Morale is tanking.', choices: [
      { text: 'Side with the designer — UX specs are non-negotiable.', effects: { morale: -15, reputation: -5 }, feedback: 'Developer feels unheard. Starts quiet-quitting.' },
      { text: 'Side with the developer — they know what\'s technically feasible.', effects: { morale: -10, reputation: -5 }, feedback: 'Designer loses motivation. Quality of designs drops.' },
      { text: 'Sit them both down. Set up a weekly design-dev sync with clear handoff rules.', effects: { morale: 20, users: 200, reputation: 12 }, feedback: 'Process fixes conflict. They actually become a great team.' },
      { text: 'Tell them to work it out themselves.', effects: { morale: -20, reputation: -8 }, feedback: 'It escalates. Designer quits.' },
    ]},
    // --- PIVOT DECISIONS ---
    { title: '⚙️ Product Decision', category: 'Pivot', description: 'Users request feature X but it\'ll take 2 months. Do you?', choices: [
      { text: 'Build it — the customer is always right', effects: { users: 300, cash: -8000 }, feedback: 'Feature shipped but delayed other priorities.' },
      { text: 'Build an MVP version in 2 weeks', effects: { users: 200, revenue: 8000, reputation: 8 }, feedback: 'Fast iteration! Users are happy enough.' },
      { text: 'Say no and focus on core', effects: { morale: -10, revenue: 5000, reputation: 3 }, feedback: 'Focused but some users churn.' },
      { text: 'Partner with another tool that has this feature', effects: { users: 500, revenue: 10000, reputation: 10 }, feedback: 'Smart partnership! Best of both worlds.' },
    ]},
    { title: '💼 Investor Meeting', category: 'Startup', description: 'A VC wants to invest $200K for 20% equity. Take it?', choices: [
      { text: 'Take the deal', effects: { cash: 200000, morale: 10, reputation: 5 }, feedback: 'Cash runway extended! But you gave up equity.' },
      { text: 'Counter at 10% equity', effects: { cash: 100000, morale: 15, reputation: 10 }, feedback: 'Better deal. Investor respects the negotiation.' },
      { text: 'Decline — bootstrap instead', effects: { morale: 20, reputation: 8 }, feedback: 'Full control maintained. Risky but admirable.' },
      { text: 'Ask for $100K as a convertible note', effects: { cash: 100000, morale: 10, reputation: 8 }, feedback: 'Smart structure — no equity given yet.' },
    ]},
    { title: '🏆 Competition', category: 'Pivot', description: 'A well-funded competitor launches a similar product. React?', choices: [
      { text: 'Lower prices to compete', effects: { revenue: -10000, reputation: -5 }, feedback: 'Race to the bottom. Never compete on price.' },
      { text: 'Double down on your niche and unique value', effects: { users: 300, revenue: 15000, reputation: 12 }, feedback: 'Niche wins! Your users are more loyal.' },
      { text: 'Copy their best features quickly', effects: { users: 100, cash: -5000, reputation: -3 }, feedback: 'Playing catch-up is exhausting.' },
      { text: 'Partner with complementary businesses', effects: { users: 500, revenue: 12000, reputation: 10 }, feedback: 'Ecosystem play — smart strategy!' },
    ]},
    { title: '🔄 The Pivot', category: 'Pivot', description: 'After 6 months, your B2C app has 5K users but only $2K MRR. A B2B company offers $10K/mo for a custom version. Pivot?', choices: [
      { text: 'Go all-in on B2B. Shut down B2C.', effects: { users: -4000, revenue: 30000, morale: -5, reputation: 5 }, feedback: 'Revenue jumps but you abandoned your community.' },
      { text: 'Keep B2C running. Build B2B on the side.', effects: { cash: -5000, revenue: 15000, morale: -15 }, feedback: 'Doing both = doing neither well. Team is burned out.' },
      { text: 'Take the B2B deal as a pilot. Test for 3 months before deciding.', effects: { revenue: 20000, morale: 10, reputation: 12 }, feedback: 'Data-driven pivot. The B2B pilot proves the model.' },
      { text: 'Say no. Double down on B2C growth.', effects: { users: 1000, revenue: 5000, reputation: 5 }, feedback: 'Loyal to the vision, but $2K MRR is unsustainable.' },
    ]},
    { title: '📉 Crisis', category: 'Cash Flow', description: 'Your biggest client (30% of revenue) wants to cancel. What do you do?', choices: [
      { text: 'Offer 50% discount to keep them', effects: { revenue: -10000, reputation: -5 }, feedback: 'Saved them but at a huge cost.' },
      { text: 'Ask what\'s wrong and offer to fix it in 48 hours', effects: { revenue: 5000, morale: 10, reputation: 10 }, feedback: 'They stay AND you improved the product!' },
      { text: 'Let them go, focus on new clients', effects: { revenue: -15000, users: 100, reputation: -3 }, feedback: 'Risky but reduces dependency.' },
      { text: 'Offer a custom solution at premium price', effects: { revenue: 10000, reputation: 8 }, feedback: 'Turned a churn into an upsell!' },
    ]},
    { title: '🎯 End Game', category: 'Growth', description: 'Final quarter. Need to hit revenue target. Best strategy?', choices: [
      { text: 'Launch an annual plan with 2 months free', effects: { revenue: 30000, reputation: 8 }, feedback: 'Annual plans boost revenue immediately!' },
      { text: 'Run a "founding member" launch for new features', effects: { users: 1000, revenue: 25000, reputation: 12 }, feedback: 'Exclusivity drives urgency!' },
      { text: 'Cold outreach blitz — email 2000 prospects', effects: { revenue: 20000, reputation: 5 }, feedback: 'Hustle works! Solid results.' },
      { text: 'Partner with 5 complementary tools for cross-promotion', effects: { users: 2000, revenue: 35000, reputation: 15 }, feedback: 'Partnerships are the ultimate growth hack!' },
    ]},
  ],
};

const NEGOTIATION_SIM: SimConfig = {
  title: 'Master Negotiator',
  icon: '⚖️',
  subtitle: 'Win 3 major deals through negotiation',
  metrics: [
    { key: 'deals', label: 'Deals Won', icon: '✅', target: 3 },
    { key: 'value', label: 'Deal Value', icon: '💰', format: '$' },
    { key: 'leverage', label: 'Leverage', icon: '🔧' },
    { key: 'reputation', label: 'Reputation', icon: '⭐' },
  ],
  winCondition: (m) => m.deals >= 3,
  winText: 'Master Negotiator! You closed 3+ winning deals!',
  loseText: "You didn't close enough favorable deals",
  totalRounds: 15,
  scenarios: [
    { title: '💼 Salary Negotiation', category: 'Salary', description: 'You got a job offer at $85K. You know the market rate is $95-110K. The recruiter asks: "Are you happy with the offer?"', choices: [
      { text: '"Yes, that works for me!"', effects: { value: -10000, leverage: -15, reputation: -5 }, feedback: 'You left $10-25K on the table. Never accept the first offer.' },
      { text: '"I\'m excited about the role. Based on my research, $105K is more aligned with market rate."', effects: { value: 20000, leverage: 15, reputation: 10 }, feedback: 'Anchored high with data. They counter at $98K — great result!' },
      { text: '"I need $130K or I walk."', effects: { leverage: -20, reputation: -15 }, feedback: 'Unreasonable anchor. They rescind the offer.' },
      { text: '"Before we discuss numbers, can we talk about the full comp package?"', effects: { leverage: 20, reputation: 12 }, feedback: 'Smart! Expanding the pie before splitting it. You negotiate equity + signing bonus too.' },
    ]},
    { title: '🏠 Real Estate Offer', category: 'Deal Making', description: 'A house is listed at $450K. It\'s been on the market for 60 days. The seller seems motivated. Your opening offer?', choices: [
      { text: 'Offer asking price — $450K', effects: { value: -30000, leverage: -10, reputation: -3 }, feedback: 'Overpaid. The seller would have taken less.' },
      { text: 'Offer $390K with a strong pre-approval letter', effects: { value: 40000, leverage: 15, deals: 1, reputation: 8 }, feedback: 'Bold but justified by days on market. Seller counters at $420K. You settle at $410K!' },
      { text: 'Offer $300K to "see what happens"', effects: { leverage: -15, reputation: -12 }, feedback: 'Insulting lowball. Agent won\'t return your calls.' },
      { text: 'Offer $415K but ask seller to cover closing costs + home warranty', effects: { value: 25000, leverage: 10, deals: 1, reputation: 10 }, feedback: 'Net savings of $15K through creative terms. Deal closed!' },
    ]},
    { title: '📦 Vendor Contract', category: 'Vendor Deals', description: 'Your key supplier wants to raise prices 20% citing "market conditions." Your business depends on them. React?', choices: [
      { text: 'Accept the increase to maintain the relationship.', effects: { value: -15000, leverage: -15, reputation: -5 }, feedback: 'You just set a precedent that you\'ll accept any increase.' },
      { text: '"I understand costs are rising. Let\'s look at a 3-year contract at 8% increase with volume commitments."', effects: { value: 10000, leverage: 15, deals: 1, reputation: 12 }, feedback: 'Win-win! They get long-term security, you get a smaller increase.' },
      { text: '"We\'ll find another supplier."', effects: { leverage: 5, reputation: -8 }, feedback: 'Empty threat if you can\'t actually switch. They call your bluff.' },
      { text: '"Show me the cost breakdown. Let\'s find the real increase together."', effects: { value: 8000, leverage: 20, reputation: 10 }, feedback: 'Transparency request reveals only 7% is justified. Negotiate from facts.' },
    ]},
    { title: '⚔️ Contract Dispute', category: 'Disputes', description: 'A client claims your deliverable missed specs and wants a 50% refund on a $40K contract. You believe the work meets requirements.', choices: [
      { text: 'Refuse any refund — the contract is clear.', effects: { value: 5000, leverage: -10, reputation: -15 }, feedback: 'Won the battle, lost the war. Client leaves a scathing review.' },
      { text: '"Let\'s review the specs together and identify exactly where we differ."', effects: { value: 5000, leverage: 15, deals: 1, reputation: 15 }, feedback: 'Found 2 minor gaps. Fixed them at minimal cost. Client renews the contract.' },
      { text: 'Give the 50% refund to avoid conflict.', effects: { value: -20000, leverage: -20, reputation: -5 }, feedback: 'You just paid $20K for being a pushover.' },
      { text: '"How about we apply $10K as credit toward a Phase 2 project?"', effects: { value: 5000, leverage: 10, reputation: 10 }, feedback: 'Turned a dispute into future business. Client feels heard.' },
    ]},
    { title: '🤝 Partnership Split', category: 'Deal Making', description: 'A potential business partner wants 50/50 equity. They bring the idea, you bring the capital ($100K) and execution.', choices: [
      { text: 'Accept 50/50 — fairness matters.', effects: { value: -30000, leverage: -15, reputation: 5 }, feedback: 'Ideas are cheap, execution is everything. You gave away too much.' },
      { text: '"I propose 70/30 with vesting. If you hit milestones, you earn up to 45%."', effects: { value: 20000, leverage: 20, deals: 1, reputation: 12 }, feedback: 'Performance-based equity is the gold standard. Both parties motivated.' },
      { text: '"I\'ll just build it myself."', effects: { leverage: -5, reputation: -10 }, feedback: 'Burned a bridge and you still need their domain expertise.' },
      { text: '"Let\'s do 60/40 but I maintain board control until revenue hits $500K."', effects: { value: 15000, leverage: 15, deals: 1, reputation: 8 }, feedback: 'Smart governance structure. Protects your investment.' },
    ]},
    { title: '🔥 Hostage-Style Tactic', category: 'Advanced Tactics', description: 'Mid-negotiation, the other party says: "This is our final offer. Take it or leave it." You know they need this deal too.', choices: [
      { text: 'Take it — they sound serious.', effects: { value: -10000, leverage: -15, reputation: -5 }, feedback: 'Classic bluff and you fell for it.' },
      { text: '"I understand. Let me review this with my team and get back to you Monday."', effects: { leverage: 20, reputation: 10 }, feedback: 'Time pressure reversed. They call you Saturday with a better offer.' },
      { text: '"Then we\'re done here." Stand up and walk out.', effects: { leverage: 10, reputation: 5 }, feedback: 'Risky but effective. They chase you in the parking lot with a concession.' },
      { text: '"I respect that. Before I decide — can you help me understand why X term can\'t flex?"', effects: { leverage: 15, reputation: 12 }, feedback: 'Reframed from ultimatum to problem-solving. Found flexibility they didn\'t offer.' },
    ]},
    { title: '💎 Multi-Party Deal', category: 'Advanced Tactics', description: 'Three companies want your exclusive distribution. Company A offers $500K, B offers $400K + marketing support, C offers $350K + equity stake.', choices: [
      { text: 'Take Company A — highest cash offer.', effects: { value: 10000, leverage: -5, reputation: 5 }, feedback: 'Good short-term but you left strategic value on the table.' },
      { text: 'Tell each company about the competing offers and ask for best-and-final.', effects: { value: 30000, leverage: 20, deals: 1, reputation: 10 }, feedback: 'Competitive bidding! Company A goes to $650K. Masterful.' },
      { text: 'Take Company C — equity has the most upside.', effects: { value: 5000, leverage: 10, reputation: 8 }, feedback: 'High-risk bet. Could pay off big or be worth nothing.' },
      { text: 'Propose a non-exclusive deal to two of them at $350K each.', effects: { value: 25000, leverage: 15, deals: 1, reputation: 12 }, feedback: 'Creative! $700K total and you\'re not locked in. Brilliant.' },
    ]},
    { title: '🏢 Lease Negotiation', category: 'Vendor Deals', description: 'Your office lease is up. Landlord wants to increase rent 15%. The market is soft with high vacancy.', choices: [
      { text: 'Pay the increase to avoid moving hassle.', effects: { value: -12000, leverage: -15, reputation: -5 }, feedback: 'You\'re paying above market. Landlord is thrilled.' },
      { text: '"We have 3 other spaces at lower rates. We\'ll stay at current rent + 3-year commitment."', effects: { value: 15000, leverage: 15, deals: 1, reputation: 10 }, feedback: 'BATNA power! Landlord agrees to 2% increase with 3 months free.' },
      { text: '"We\'re leaving."', effects: { value: -5000, leverage: -5, reputation: -8 }, feedback: 'Moving costs eat your savings. Should have negotiated.' },
      { text: '"Let\'s restructure: lower base rent + percentage of revenue above a threshold."', effects: { value: 10000, leverage: 20, reputation: 12 }, feedback: 'Innovative deal structure. Landlord likes the upside alignment.' },
    ]},
    { title: '⏰ Deadline Pressure', category: 'Salary', description: 'You have two job offers. Company A gives you 48 hours to decide. Company B is slower — final interview next week.', choices: [
      { text: 'Accept Company A before the deadline.', effects: { value: -5000, leverage: -10, reputation: 3 }, feedback: 'Safe but you may have gotten a better offer from B.' },
      { text: 'Tell Company A you need until next Friday. Be honest about competing process.', effects: { leverage: 15, reputation: 10 }, feedback: 'Transparency works. Company A extends to Friday and sweetens their offer.' },
      { text: 'Decline Company A and bet on Company B.', effects: { leverage: -5, reputation: -5 }, feedback: 'Risky gamble. If B doesn\'t work out, you have nothing.' },
      { text: 'Ask Company B to accelerate their timeline, sharing you have a deadline.', effects: { leverage: 20, deals: 1, value: 15000, reputation: 12 }, feedback: 'B moves up the interview. You now negotiate with both offers in hand!' },
    ]},
    { title: '🛡️ Non-Compete Clause', category: 'Disputes', description: 'Your new employer\'s contract has a 2-year non-compete covering your entire industry. The role is perfect otherwise.', choices: [
      { text: 'Sign it — you won\'t leave anyway.', effects: { leverage: -20, reputation: -5 }, feedback: 'You just handcuffed your future self. Big mistake.' },
      { text: '"I\'m happy to sign a 6-month non-compete limited to direct competitors."', effects: { leverage: 15, deals: 1, reputation: 10 }, feedback: 'Reasonable counter. They agree to 1 year, same industry, 50-mile radius.' },
      { text: 'Refuse and walk away from the offer.', effects: { leverage: -5, reputation: -3 }, feedback: 'Principled but you lost a great opportunity without trying.' },
      { text: '"I\'ll sign as-is if you add a $50K severance trigger if you enforce it."', effects: { leverage: 20, value: 10000, reputation: 12 }, feedback: 'They\'ll think twice before enforcing. If they do, you\'re compensated.' },
    ]},
    { title: '📊 Budget Negotiation', category: 'Deal Making', description: 'Your department needs $200K for a new initiative. The CFO says the budget is $120K max.', choices: [
      { text: 'Accept $120K and cut scope.', effects: { value: -5000, leverage: -10, reputation: 3 }, feedback: 'Delivered less impact. Next year\'s budget will be smaller.' },
      { text: '"What if we phase it: $80K now with $120K in Q3 if we hit KPIs?"', effects: { value: 10000, leverage: 15, deals: 1, reputation: 12 }, feedback: 'De-risked the ask. CFO loves performance-linked budgets.' },
      { text: '"It\'s $200K or we fall behind competitors."', effects: { leverage: -10, reputation: -8 }, feedback: 'Scare tactics don\'t work on CFOs with spreadsheets.' },
      { text: '"Let me show you the ROI model. $200K generates $600K in 12 months."', effects: { value: 8000, leverage: 10, reputation: 10 }, feedback: 'Data-driven pitch. CFO approves $160K. Not bad.' },
    ]},
    { title: '🔄 Renegotiation', category: 'Vendor Deals', description: 'Your SaaS vendor auto-renewed at 25% higher rate. You just noticed. Contract says 30-day notice required.', choices: [
      { text: 'Pay it. You missed the window.', effects: { value: -8000, leverage: -15, reputation: -5 }, feedback: 'Expensive lesson. Always calendar renewal dates.' },
      { text: 'Call and escalate. Ask for a goodwill adjustment as a long-term customer.', effects: { value: 5000, leverage: 10, reputation: 8 }, feedback: 'Got a 10% credit. Retention teams have authority to flex.' },
      { text: 'Threaten to switch competitors publicly on social media.', effects: { leverage: -10, reputation: -15 }, feedback: 'Burned the relationship and looked unprofessional.' },
      { text: '"We\'re evaluating alternatives. Can you match our current rate for 6 months while we decide?"', effects: { value: 8000, leverage: 15, deals: 1, reputation: 10 }, feedback: 'Bought time and leverage. They freeze the rate and add features.' },
    ]},
  ],
};

const MARKETING_AGENCY_SIM: SimConfig = {
  title: 'Agency Boss',
  icon: '📣',
  subtitle: 'Grow your agency to $50K monthly revenue',
  metrics: [
    { key: 'revenue', label: 'Monthly Rev', icon: '💰', target: 50000, format: '$' },
    { key: 'clients', label: 'Clients', icon: '👥' },
    { key: 'teamSize', label: 'Team', icon: '🏢' },
    { key: 'reputation', label: 'Reputation', icon: '⭐' },
  ],
  winCondition: (m) => m.revenue >= 50000,
  winText: 'Agency Boss! $50K/mo revenue achieved!',
  loseText: "Your agency didn't hit the revenue target",
  totalRounds: 15,
  scenarios: [
    { title: '🎯 Client Pitch', category: 'Client Relations', description: 'A local restaurant chain with 12 locations wants digital marketing. Budget: $5K/mo. They ask: "Why should we pick you over a bigger agency?"', choices: [
      { text: '"We\'re cheaper than the big guys."', effects: { reputation: -10, revenue: 2000, clients: 1 }, feedback: 'Competing on price devalues your agency.' },
      { text: '"We specialize in restaurant marketing. Here\'s a case study where we 3x\'d a similar chain\'s online orders."', effects: { reputation: 15, revenue: 5000, clients: 1 }, feedback: 'Niche expertise + proof = instant credibility. They sign!' },
      { text: '"We offer everything: SEO, PPC, social, email, print..."', effects: { reputation: -5 }, feedback: 'Jack of all trades = master of none. They pass.' },
      { text: '"Let me run a free 2-week audit first. The results will speak for themselves."', effects: { reputation: 10, revenue: 3000, clients: 1 }, feedback: 'Audit reveals $20K in wasted ad spend. They\'re impressed and sign.' },
    ]},
    { title: '💰 Budget Allocation', category: 'Strategy', description: 'New client gives you $10K/mo. They want "everything." How do you allocate?', choices: [
      { text: 'Split evenly across 5 channels.', effects: { revenue: 2000, reputation: -5 }, feedback: 'Spreading too thin. No channel gets enough to work.' },
      { text: 'Put 70% into the highest-ROI channel based on their data, 30% for testing.', effects: { revenue: 5000, reputation: 12, clients: 0 }, feedback: 'Data-driven allocation. Client sees results in month 1!' },
      { text: 'All into Facebook Ads — it\'s what you know best.', effects: { revenue: 3000, reputation: -3 }, feedback: 'Decent results but you missed Google where their audience actually is.' },
      { text: '"Let\'s start with a $3K test month across 3 channels, then scale the winner."', effects: { revenue: 4000, reputation: 10 }, feedback: 'Smart test-first approach. Client appreciates the methodology.' },
    ]},
    { title: '🔥 Campaign Crisis', category: 'Crisis Management', description: 'Your client\'s Facebook Ad account gets flagged and suspended. $15K/mo in ad spend frozen. Client is panicking.', choices: [
      { text: '"That\'s Facebook\'s fault, not ours."', effects: { reputation: -20, clients: -1, revenue: -5000 }, feedback: 'Blame-shifting loses clients instantly.' },
      { text: 'Immediately shift budget to Google Ads + email while filing the appeal.', effects: { reputation: 15, revenue: 2000 }, feedback: 'Quick pivot kept the leads flowing. Client barely noticed.' },
      { text: '"Let me look into it and get back to you next week."', effects: { reputation: -10 }, feedback: 'Too slow. Client is losing money every day.' },
      { text: 'Call Facebook rep, file appeal, send client a detailed action plan within 2 hours.', effects: { reputation: 20, revenue: 3000 }, feedback: 'Proactive crisis management. Account restored in 48 hours. Trust deepened.' },
    ]},
    { title: '👥 Team Scaling', category: 'Operations', description: 'You have 8 clients and you\'re doing everything yourself. Burnout is hitting. First hire?', choices: [
      { text: 'A senior strategist at $6K/mo.', effects: { teamSize: 1, revenue: 8000, reputation: 5 }, feedback: 'Expensive but immediately handles 3 clients. You breathe again.' },
      { text: 'A junior VA at $1.5K/mo.', effects: { teamSize: 1, revenue: 2000 }, feedback: 'Helps with tasks but can\'t think strategically.' },
      { text: 'Two freelance specialists at $3K/mo each.', effects: { teamSize: 2, revenue: 6000, reputation: 8 }, feedback: 'Flexible and skilled. Best bang for the buck at this stage.' },
      { text: 'No one. Grind harder.', effects: { reputation: -10, clients: -2, revenue: -4000 }, feedback: 'You drop the ball on 2 clients. They leave.' },
    ]},
    { title: '📊 Client Reporting', category: 'Client Relations', description: 'Monthly report time. Results are mediocre — leads are up 10% but the client expected 30%. How do you present it?', choices: [
      { text: 'Send a fancy PDF with charts that obscure the real numbers.', effects: { reputation: -15 }, feedback: 'Client sees through it. Trust damaged.' },
      { text: '"Here\'s what worked, what didn\'t, and our plan to fix it. Expect 25% improvement next month."', effects: { reputation: 15, revenue: 2000 }, feedback: 'Honest + action plan = trust. They give you another month.' },
      { text: '"SEO takes time. Be patient."', effects: { reputation: -10, clients: -1, revenue: -3000 }, feedback: 'They don\'t have patience. They fire you.' },
      { text: '"Let me show you competitor data — 10% is actually above industry average."', effects: { reputation: 8, revenue: 1000 }, feedback: 'Context helps but doesn\'t excuse underperformance.' },
    ]},
    { title: '🚀 Niche vs Generalist', category: 'Strategy', description: 'You\'re getting leads from different industries. Should you niche down or stay generalist?', choices: [
      { text: 'Stay generalist — more potential clients.', effects: { clients: 2, revenue: 4000, reputation: -3 }, feedback: 'More clients but hard to stand out. Commoditized.' },
      { text: 'Niche into your best-performing industry. Rebrand everything.', effects: { clients: 1, revenue: 8000, reputation: 15 }, feedback: 'Became the go-to agency in that space. Premium pricing unlocked!' },
      { text: 'Create sub-brands for 3 different niches.', effects: { revenue: 3000, reputation: -5, teamSize: -1 }, feedback: 'Spread too thin. Identity crisis.' },
      { text: 'Test 2 niches with separate landing pages. Let data decide.', effects: { clients: 1, revenue: 6000, reputation: 10 }, feedback: 'Smart testing. One niche clearly wins. Focused effort.' },
    ]},
    { title: '😡 Difficult Client', category: 'Client Relations', description: 'Your biggest client ($8K/mo) calls daily, changes direction weekly, and berates your team. What do you do?', choices: [
      { text: 'Fire them. No amount of money is worth this.', effects: { revenue: -8000, reputation: 5, teamSize: 0 }, feedback: 'Team morale improves but that\'s a big revenue hit.' },
      { text: '"I need to set some boundaries. Weekly calls, 2 revisions per month, changes locked after approval."', effects: { revenue: 2000, reputation: 12 }, feedback: 'Professional boundaries. Client pushes back but respects you more.' },
      { text: 'Keep enduring it. The money matters.', effects: { revenue: 1000, reputation: -10, teamSize: -1 }, feedback: 'Your best employee quits. The client cost you more than they paid.' },
      { text: 'Raise their rate 50% to compensate for the extra work.', effects: { revenue: 4000, reputation: 8 }, feedback: 'Price reflects the real cost. They either pay more or leave. Win-win.' },
    ]},
    { title: '🤖 AI Disruption', category: 'Strategy', description: 'Clients start asking why they need your agency when ChatGPT can write their content. How do you respond?', choices: [
      { text: '"AI can\'t replace human creativity."', effects: { reputation: -5 }, feedback: 'Sounds defensive. They\'ve heard this before.' },
      { text: '"We use AI to do in 2 hours what used to take 20 — and reinvest that time into strategy."', effects: { revenue: 5000, reputation: 15 }, feedback: 'AI as accelerator, not threat. Clients love the efficiency gains.' },
      { text: 'Ignore the question and change the subject.', effects: { reputation: -10, clients: -1 }, feedback: 'They think you\'re behind the times.' },
      { text: '"Let me show you our AI-powered workflow vs pure AI output. The difference is strategy + brand voice."', effects: { revenue: 4000, reputation: 12 }, feedback: 'Demonstrated clear value-add. Clients see why they still need you.' },
    ]},
    { title: '📈 Retainer vs Project', category: 'Operations', description: 'A big company wants a one-time $25K website project. Your model is monthly retainers. Take it?', choices: [
      { text: 'Take the $25K project. Money is money.', effects: { revenue: 8000, reputation: 3 }, feedback: 'One-time cash but no recurring revenue. Feast-or-famine cycle.' },
      { text: '"We\'ll do the website for $20K + $3K/mo retainer for ongoing optimization."', effects: { revenue: 10000, clients: 1, reputation: 12 }, feedback: 'Bundled deal! Recurring revenue from day one. Smart.' },
      { text: 'Decline. It\'s not your business model.', effects: { reputation: -5 }, feedback: 'Too rigid. Lost a potential long-term client.' },
      { text: '"Let\'s do $25K for the site + 3-month $5K trial retainer. If ROI is there, we continue."', effects: { revenue: 12000, clients: 1, reputation: 10 }, feedback: 'Foot-in-the-door. Trial converts to full retainer after month 2.' },
    ]},
    { title: '🏆 Award or Marketing?', category: 'Strategy', description: 'You can spend $5K entering industry awards OR $5K on your own marketing. Which one?', choices: [
      { text: 'Awards — the badge boosts credibility.', effects: { revenue: 3000, reputation: 10 }, feedback: 'You win! "Award-winning agency" closes 2 new clients.' },
      { text: 'Marketing — case study video series on YouTube.', effects: { revenue: 6000, reputation: 8, clients: 1 }, feedback: 'Content compounds. Leads come in for months.' },
      { text: 'Split $2.5K each.', effects: { revenue: 2000, reputation: 3 }, feedback: 'Half-measures, half results.' },
      { text: 'Neither — spend it on team training instead.', effects: { reputation: 5, teamSize: 0, revenue: 4000 }, feedback: 'Better team = better results = organic growth. Long game.' },
    ]},
    { title: '💀 Client Poaching', category: 'Crisis Management', description: 'Your account manager just quit and is trying to take 3 of your clients. What do you do?', choices: [
      { text: 'Threaten legal action immediately.', effects: { reputation: -8, revenue: -2000 }, feedback: 'Aggressive reaction. 1 client leaves out of spite.' },
      { text: 'Call all 3 clients personally. Show them the depth of your team and offer a discount.', effects: { reputation: 10, revenue: 3000, clients: 0 }, feedback: 'Personal touch keeps them. They appreciate you reaching out.' },
      { text: 'Let them go. If clients leave that easily, they weren\'t loyal.', effects: { revenue: -8000, clients: -2, reputation: -5 }, feedback: 'Lost $8K/mo. Could have fought for them.' },
      { text: 'Call the clients, assign a stronger manager, and review all non-competes going forward.', effects: { reputation: 15, revenue: 2000 }, feedback: 'Retained all 3 clients and fixed the systemic issue. CEO move.' },
    ]},
    { title: '📱 Social Media Fail', category: 'Crisis Management', description: 'Your intern accidentally posted a meme on a corporate client\'s LinkedIn. It\'s getting traction — but not the good kind.', choices: [
      { text: 'Delete it and pretend nothing happened.', effects: { reputation: -15, clients: -1 }, feedback: 'Screenshots are forever. Client finds out and fires you.' },
      { text: 'Delete it immediately, call the client, take full responsibility, offer a month free.', effects: { reputation: 10, revenue: -3000 }, feedback: 'Transparency and accountability. Client stays but watches you closely.' },
      { text: 'Blame the intern publicly.', effects: { reputation: -20, teamSize: -1 }, feedback: 'Unprofessional. Intern quits, client fires you, industry talks.' },
      { text: 'Lean into it. Turn the meme into a lighthearted brand moment.', effects: { reputation: 15, revenue: 2000 }, feedback: 'Bold move that works! Engagement is 10x normal. Client\'s brand looks human.' },
    ]},
  ],
};

const PERSUASION_SIM: SimConfig = {
  title: 'Master Persuader',
  icon: '🧠',
  subtitle: 'Successfully persuade 4 out of 6 people',
  metrics: [
    { key: 'converts', label: 'Persuaded', icon: '✅', target: 4 },
    { key: 'influence', label: 'Influence', icon: '🎯' },
    { key: 'credibility', label: 'Credibility', icon: '📊' },
    { key: 'reputation', label: 'Ethics', icon: '⭐' },
  ],
  winCondition: (m) => m.converts >= 4,
  winText: 'Master Persuader! You convinced 4+ people!',
  loseText: "You didn't persuade enough people",
  totalRounds: 15,
  scenarios: [
    { title: '🤔 The Skeptic', category: 'Conviction', description: 'A colleague is convinced remote work kills productivity. You have data showing otherwise. How do you convince them?', choices: [
      { text: '"You\'re wrong. Here are the stats."', effects: { influence: -15, credibility: -10, reputation: -5 }, feedback: 'Nobody changes their mind when told they\'re wrong.' },
      { text: '"What if both views have merit? In what scenarios do you think remote works best?"', effects: { influence: 20, credibility: 10, converts: 1, reputation: 10 }, feedback: 'Socratic method! They talk themselves into a nuanced view.' },
      { text: 'Send them a 30-page research paper.', effects: { influence: -5, credibility: 5 }, feedback: 'Nobody reads 30 pages. Wrong format for persuasion.' },
      { text: '"I felt the same way. Then I tried X and my results changed. Curious if it would work for your team?"', effects: { influence: 15, credibility: 8, reputation: 8 }, feedback: 'Personal story + curiosity gap. They\'re open to trying it.' },
    ]},
    { title: '💡 Pitch an Idea', category: 'Pitching', description: 'You want your company to adopt a 4-day work week. Your boss is traditional. How do you pitch it?', choices: [
      { text: '"Everyone is doing it. We should too."', effects: { influence: -10, credibility: -8, reputation: -3 }, feedback: 'Bandwagon fallacy. Boss hates trends.' },
      { text: '"Microsoft Japan saw 40% productivity increase. Can we pilot it for one quarter with clear KPIs?"', effects: { influence: 20, credibility: 15, converts: 1, reputation: 10 }, feedback: 'Data + low-risk pilot = yes! Pilot gets approved.' },
      { text: '"I need a better work-life balance."', effects: { influence: -15, credibility: -10, reputation: -5 }, feedback: 'Making it personal instead of business-focused. Rejected.' },
      { text: '"Our competitors are losing talent to companies offering this. Here\'s our attrition data."', effects: { influence: 15, credibility: 12, reputation: 8 }, feedback: 'Framed as a business risk. Boss takes it seriously.' },
    ]},
    { title: '🔄 Change Someone\'s Mind', category: 'Conviction', description: 'Your friend is about to invest their life savings in a crypto meme coin. You think it\'s a terrible idea. How do you intervene?', choices: [
      { text: '"That\'s a scam! Don\'t be stupid."', effects: { influence: -20, credibility: -5, reputation: -10 }, feedback: 'Insults trigger defensiveness. They invest even more.' },
      { text: '"Walk me through your thesis. What happens if it drops 80%? What\'s your exit plan?"', effects: { influence: 15, credibility: 10, converts: 1, reputation: 12 }, feedback: 'Asking them to articulate risk makes them realize they haven\'t thought it through.' },
      { text: '"I\'ve been researching this. Can I show you what happened to people who invested in [similar coin]?"', effects: { influence: 20, credibility: 12, converts: 1, reputation: 10 }, feedback: 'Social proof of failure is powerful. They reduce their investment 80%.' },
      { text: 'Say nothing. It\'s their money.', effects: { influence: -5, reputation: 5 }, feedback: 'Respectful but you watched a friend lose their savings.' },
    ]},
    { title: '⚖️ Ethical Dilemma', category: 'Ethics', description: 'Your boss asks you to present misleading data in a client pitch to close a big deal. What do you do?', choices: [
      { text: 'Do it. The deal is worth it.', effects: { influence: 5, credibility: -20, reputation: -25 }, feedback: 'Short-term gain, long-term disaster. Client finds out later and sues.' },
      { text: '"I can present the data in its best light honestly. Let me reframe the narrative."', effects: { influence: 15, credibility: 15, converts: 1, reputation: 15 }, feedback: 'Ethical persuasion. The honest pitch actually converts better.' },
      { text: 'Refuse and report to HR.', effects: { influence: -10, credibility: 10, reputation: 10 }, feedback: 'Principled but you\'ve made an enemy of your boss.' },
      { text: '"Let me find additional data points that genuinely support our case."', effects: { influence: 10, credibility: 12, reputation: 12 }, feedback: 'Found real supporting data. Didn\'t need to lie.' },
    ]},
    { title: '🎤 Public Speaking', category: 'Pitching', description: 'You\'re presenting to 200 people. 30 seconds in, you notice people checking their phones. How do you recover?', choices: [
      { text: 'Keep going with your script. They\'ll come around.', effects: { influence: -10, credibility: -5 }, feedback: 'Lost them. 50% leave by the 10-minute mark.' },
      { text: '"Stop. Forget my slides. Let me tell you about the worst mistake I ever made in this industry."', effects: { influence: 25, credibility: 10, converts: 1, reputation: 8 }, feedback: 'Vulnerability + story = every phone goes down. Standing ovation.' },
      { text: '"Raise your hand if you\'ve ever [relatable problem]." Then wait.', effects: { influence: 15, credibility: 8, reputation: 5 }, feedback: 'Audience interaction resets attention. Good recovery.' },
      { text: 'Speed up to get through the material faster.', effects: { influence: -15, credibility: -8 }, feedback: 'Faster ≠ better. They understood even less.' },
    ]},
    { title: '🤝 Board Buy-In', category: 'Pitching', description: 'You need the board to approve a $500K initiative. The CFO is against it, the CEO is neutral. How do you prepare?', choices: [
      { text: 'Focus your pitch on the CEO. Ignore the CFO.', effects: { influence: -10, credibility: -5 }, feedback: 'CFO vetoes it. Should have addressed their concerns.' },
      { text: 'Meet the CFO privately first. Understand their objections and build them into your pitch.', effects: { influence: 20, credibility: 15, converts: 1, reputation: 12 }, feedback: 'Pre-meeting alignment. CFO becomes your advocate. Approved unanimously.' },
      { text: 'Send a detailed 40-slide deck the night before.', effects: { influence: -5, credibility: 3 }, feedback: 'Nobody read it. You wasted your prep time.' },
      { text: '"The ROI is clear: $500K in, $2M out in 18 months. Here\'s the model."', effects: { influence: 10, credibility: 10, reputation: 5 }, feedback: 'Good data but CFO still had concerns you didn\'t address.' },
    ]},
    { title: '😤 Angry Customer', category: 'De-escalation', description: 'A customer is yelling in your store about a defective product. Other customers are watching. Calm them down.', choices: [
      { text: '"Sir, please calm down."', effects: { influence: -15, reputation: -8 }, feedback: 'Telling people to calm down has never calmed anyone down.' },
      { text: '"I can see why you\'re frustrated. That shouldn\'t have happened. Let me fix this right now."', effects: { influence: 20, converts: 1, reputation: 12 }, feedback: 'Empathy + action. They go from angry to loyal customer.' },
      { text: '"Read the return policy."', effects: { influence: -20, reputation: -15 }, feedback: 'They post a viral video trashing your store.' },
      { text: '"Come with me to the back where I can give you my full attention and sort this out."', effects: { influence: 15, reputation: 10 }, feedback: 'De-escalated from public. Private resolution is easier.' },
    ]},
    { title: '🧩 Team Alignment', category: 'Conviction', description: 'Your team is split 50/50 on a critical technical decision. Debate has stalled for 2 weeks. Unite them.', choices: [
      { text: 'Pull rank and decide for them.', effects: { influence: -10, credibility: -5, reputation: -8 }, feedback: 'Half the team feels unheard. Resentment builds.' },
      { text: '"Let\'s define success criteria first, then evaluate both options against them."', effects: { influence: 20, credibility: 12, converts: 1, reputation: 10 }, feedback: 'Framework-based decision-making. Team aligns in 1 meeting.' },
      { text: 'Let them keep debating until they figure it out.', effects: { influence: -15, credibility: -8 }, feedback: 'Three more weeks of paralysis. Project delayed.' },
      { text: '"What if we prototype both for 3 days and let data decide?"', effects: { influence: 15, credibility: 10, reputation: 8 }, feedback: 'Turned opinions into experiments. Clear winner emerges.' },
    ]},
    { title: '📢 Convince Investors', category: 'Pitching', description: 'You have 3 minutes in an elevator with a VC. Your startup has traction but no profit yet. Go.', choices: [
      { text: '"We\'re an AI-powered blockchain SaaS platform—"', effects: { influence: -15, credibility: -10 }, feedback: 'Buzzword bingo. VC mentally checked out at "blockchain."' },
      { text: '"500 customers are paying $50/mo and growing 20% monthly. We need $1M to reach profitability in 6 months."', effects: { influence: 25, credibility: 15, converts: 1, reputation: 10 }, feedback: 'Metrics + clear ask. VC gives you their card and schedules a meeting.' },
      { text: '"Let me show you our deck—" pulls out laptop.', effects: { influence: -10, credibility: -5 }, feedback: 'It\'s an elevator, not a boardroom.' },
      { text: '"We solve [specific problem] for [specific customer]. Last month they told me [powerful quote]."', effects: { influence: 15, credibility: 10, reputation: 8 }, feedback: 'Customer story sticks. VC remembers you.' },
    ]},
    { title: '🔒 Build Trust First', category: 'Ethics', description: 'You\'re selling consulting services to a prospect who\'s been burned by 3 previous consultants. Trust is near zero.', choices: [
      { text: '"We\'re different. Trust us."', effects: { influence: -15, credibility: -10, reputation: -5 }, feedback: 'That\'s what the other 3 said.' },
      { text: '"I won\'t ask you to trust me. Let\'s do a $500 diagnostic first. If you don\'t see value, walk away."', effects: { influence: 20, credibility: 15, converts: 1, reputation: 12 }, feedback: 'Zero-risk offer. They try it, love the results, and sign a $50K contract.' },
      { text: 'Show them 10 case studies and testimonials.', effects: { influence: 5, credibility: 5 }, feedback: 'Helps but doesn\'t address their specific trauma.' },
      { text: '"Before I pitch anything — what specifically went wrong with the last consultants?"', effects: { influence: 15, credibility: 12, reputation: 10 }, feedback: 'Understanding their pain shows you\'re different. Trust begins.' },
    ]},
    { title: '🎭 Negotiate a Raise', category: 'De-escalation', description: 'Your best employee wants a 30% raise or they leave. Budget allows 10%. Keep them without lying.', choices: [
      { text: '"Sorry, budget is tight. Best I can do is 10%."', effects: { influence: -10, credibility: -5 }, feedback: 'They leave. Replacing them costs 3x the raise.' },
      { text: '"15% now, title promotion, and let\'s revisit in 6 months tied to these KPIs."', effects: { influence: 20, converts: 1, credibility: 10, reputation: 12 }, feedback: 'Total comp package exceeds their ask in value. They stay happily.' },
      { text: '"You\'re not worth 30% more."', effects: { influence: -25, credibility: -15, reputation: -15 }, feedback: 'They leave and take 2 others with them.' },
      { text: '"What would make this role your dream job beyond salary?"', effects: { influence: 15, credibility: 8, reputation: 10 }, feedback: 'They want remote flexibility and conference budget. Cheap to provide!' },
    ]},
  ],
};

const REAL_ESTATE_SIM: SimConfig = {
  title: 'Real Estate Mogul',
  icon: '🏠',
  subtitle: 'Build a portfolio worth $500K in equity',
  metrics: [
    { key: 'equity', label: 'Equity', icon: '💎', target: 500000, format: '$' },
    { key: 'cashflow', label: 'Cash Flow', icon: '💰', format: '$' },
    { key: 'properties', label: 'Properties', icon: '🏘️' },
    { key: 'reputation', label: 'Reputation', icon: '⭐' },
  ],
  winCondition: (m) => m.equity >= 500000,
  winText: 'Real Estate Mogul! $500K equity portfolio!',
  loseText: "Your portfolio didn't reach the target",
  totalRounds: 15,
  scenarios: [
    { title: '🔍 Property Evaluation', category: 'Analysis', description: 'A 4-unit building listed at $400K. Rents are $800/unit. Roof needs $15K. Neighborhood is gentrifying. Evaluate.', choices: [
      { text: 'Buy at asking price — the upside is obvious.', effects: { equity: 30000, cashflow: 500, properties: 1, reputation: -3 }, feedback: 'Overpaid. Should have negotiated knowing about the roof.' },
      { text: 'Offer $360K citing the roof repair + pull rent comps showing units are under-market.', effects: { equity: 80000, cashflow: 1200, properties: 1, reputation: 10 }, feedback: 'Bought below value, raised rents to $950. Instant equity creation!' },
      { text: 'Pass — too much risk.', effects: { reputation: -5 }, feedback: 'The deal was solid. Someone else made $100K on it.' },
      { text: 'Offer $340K cash, close in 14 days.', effects: { equity: 100000, cashflow: 1000, properties: 1, reputation: 12 }, feedback: 'Cash + speed = massive discount. Seller was motivated. Home run!' },
    ]},
    { title: '🤝 Buyer Negotiation', category: 'Negotiation', description: 'You\'re selling a flip. Listed at $320K. Buyer offers $285K with an FHA loan (slower close). What do you counter?', choices: [
      { text: 'Accept $285K — any sale is a good sale.', effects: { equity: -15000, reputation: -5 }, feedback: 'Left money on the table. Patience pays in real estate.' },
      { text: '"$310K firm. The comps support it. I have 2 more showings this weekend."', effects: { equity: 20000, cashflow: 5000, reputation: 10 }, feedback: 'Scarcity creates urgency. Buyer comes back at $305K. Deal!' },
      { text: '"$320K or nothing."', effects: { reputation: -8 }, feedback: 'Too rigid. Buyer moves on. House sits for 2 more months.' },
      { text: '"$300K if you can switch to conventional and close in 30 days."', effects: { equity: 10000, cashflow: 3000, reputation: 8 }, feedback: 'Faster close saves you carrying costs. Win-win.' },
    ]},
    { title: '📈 Market Timing', category: 'Strategy', description: 'Interest rates just dropped 1%. Prices are starting to climb. You have $100K liquid. Strategy?', choices: [
      { text: 'Wait for prices to drop more.', effects: { equity: -20000, reputation: -5 }, feedback: 'Prices climbed 15% while you waited. Missed the window.' },
      { text: 'Buy 2 properties using leverage. Lock in low rates.', effects: { equity: 120000, cashflow: 2000, properties: 2, reputation: 12 }, feedback: 'Low rates + leverage = massive equity gains as prices rose. Brilliant timing!' },
      { text: 'Put it all into one premium property.', effects: { equity: 60000, cashflow: 500, properties: 1, reputation: 5 }, feedback: 'Decent but you concentrated risk in one asset.' },
      { text: 'Buy a REIT index fund instead.', effects: { equity: 30000, reputation: 3 }, feedback: 'Safe and hands-off but way less return than direct ownership.' },
    ]},
    { title: '🔧 Tenant Crisis', category: 'Management', description: 'Your tenant hasn\'t paid rent in 2 months. They say they lost their job. $3,600 owed.', choices: [
      { text: 'Start eviction immediately.', effects: { cashflow: -2000, reputation: -10 }, feedback: 'Legal costs + 3 months vacant = $8K total loss. Eviction isn\'t free.' },
      { text: '"Let\'s create a payment plan. $600 extra per month on top of rent until caught up."', effects: { cashflow: 1000, reputation: 12 }, feedback: 'Tenant catches up in 6 months. Stayed long-term. Compassion + business sense.' },
      { text: '"Cash for keys. I\'ll forgive $1,800 if you\'re out in 2 weeks."', effects: { cashflow: -1800, reputation: 5 }, feedback: 'Quick resolution. New tenant at higher rent covers the loss in 3 months.' },
      { text: 'Do nothing and hope they pay.', effects: { cashflow: -3600, reputation: -8 }, feedback: 'Month 3: still no payment. Now eviction is harder and more expensive.' },
    ]},
    { title: '💰 Investment Decision', category: 'Strategy', description: 'You have $50K. Option A: Down payment on a $250K rental (6% cap rate). Option B: Flip a $120K distressed property (estimated $60K profit). Option C: Wholesale deals (no capital needed).', choices: [
      { text: 'Buy the rental for long-term cash flow.', effects: { equity: 50000, cashflow: 1500, properties: 1, reputation: 8 }, feedback: 'Steady income + appreciation. Safe and smart.' },
      { text: 'Do the flip. Higher return, faster.', effects: { equity: 60000, cashflow: -2000, reputation: 5 }, feedback: 'Flip profit was great but no recurring income. What\'s next?' },
      { text: 'Wholesale first to build more capital, then buy.', effects: { equity: 20000, cashflow: 8000, reputation: 10 }, feedback: 'Built cash reserves + found great deals. Patient strategy.' },
      { text: 'Split: $30K down on rental + $20K into a wholesale/flip hybrid.', effects: { equity: 70000, cashflow: 2000, properties: 1, reputation: 12 }, feedback: 'Diversified approach! Cash flow + capital gains. Best of both worlds.' },
    ]},
    { title: '🏗️ Renovation Budget', category: 'Analysis', description: 'Your flip needs work. Contractor quotes $45K for a full reno. You estimated $30K. The ARV (after-repair value) supports $45K but leaves thin margins.', choices: [
      { text: 'Pay the $45K. Quality matters.', effects: { equity: 15000, cashflow: -5000, reputation: 5 }, feedback: 'Good quality but thin margins. Barely profitable.' },
      { text: 'Get 3 more quotes. Find the right price, not the cheapest.', effects: { equity: 35000, cashflow: 2000, reputation: 10 }, feedback: 'Found a contractor at $32K with great references. Margins restored!' },
      { text: 'DIY the cosmetic work, hire out plumbing and electrical only.', effects: { equity: 40000, cashflow: 5000, reputation: 8 }, feedback: 'Saved $18K on labor. Sweat equity is real equity.' },
      { text: 'Walk away from the deal.', effects: { reputation: -3 }, feedback: 'The deal was still profitable. You let a contractor\'s quote scare you.' },
    ]},
    { title: '📋 HOA Nightmare', category: 'Management', description: 'You bought a condo to rent out. The HOA just passed a special assessment: $12K per unit for new elevators. You didn\'t see this coming.', choices: [
      { text: 'Pay it and move on.', effects: { equity: -12000, cashflow: -12000, reputation: 3 }, feedback: 'Expensive lesson. Always check HOA meeting minutes before buying.' },
      { text: 'Fight it at the next HOA meeting. Rally other owners against the assessment.', effects: { equity: -5000, cashflow: -5000, reputation: 8 }, feedback: 'Got it reduced to $8K with a payment plan. Activism pays off.' },
      { text: 'Sell the condo immediately.', effects: { equity: -20000, properties: -1, reputation: -5 }, feedback: 'Panic selling at a loss. Everyone knows about the assessment now.' },
      { text: 'Negotiate a payment plan with HOA. Raise rent $100/mo to offset.', effects: { equity: -6000, cashflow: -2000, reputation: 10 }, feedback: 'Spread the cost over 2 years and partially offset with rent increase.' },
    ]},
    { title: '🏘️ Portfolio Growth', category: 'Strategy', description: 'You own 3 properties cash-flowing $3K/mo. A lender offers a portfolio loan to pull equity and buy 3 more. Take on debt?', choices: [
      { text: 'No debt. Cash flow is king.', effects: { equity: 10000, cashflow: 3000, reputation: 5 }, feedback: 'Conservative and safe but slow growth.' },
      { text: 'Refinance at 65% LTV. Use equity for 3 more properties.', effects: { equity: 150000, cashflow: 2000, properties: 3, reputation: 12 }, feedback: 'Smart leverage! 6 properties now. Equity grows faster than interest costs.' },
      { text: 'Refinance at 80% LTV. Maximum leverage.', effects: { equity: 100000, cashflow: -1000, properties: 3, reputation: -3 }, feedback: 'Over-leveraged. One vacancy and you\'re negative cash flow.' },
      { text: 'Sell 1 property, use proceeds to buy 2 better ones.', effects: { equity: 80000, cashflow: 1500, properties: 1, reputation: 8 }, feedback: 'Upgraded portfolio quality. Smart rebalancing.' },
    ]},
    { title: '🌊 Natural Disaster', category: 'Management', description: 'A pipe burst in your rental. Tenant\'s belongings are damaged. Insurance covers the structure but not tenant\'s stuff. They\'re threatening to sue.', choices: [
      { text: '"Not my problem. You should have had renter\'s insurance."', effects: { cashflow: -5000, reputation: -15 }, feedback: 'They sue. Legal fees + settlement = $15K. Always require renter\'s insurance.' },
      { text: '"I\'m sorry this happened. Let me cover $2K of your losses and waive next month\'s rent."', effects: { cashflow: -3500, reputation: 12 }, feedback: 'Goodwill gesture prevents a lawsuit. Tenant stays and renews.' },
      { text: 'Hire a lawyer immediately.', effects: { cashflow: -8000, reputation: -5 }, feedback: 'Lawyer costs more than settling would have.' },
      { text: '"Let me file my insurance claim and see if we can get your items covered. Meanwhile, here\'s a hotel for the week."', effects: { cashflow: -1500, reputation: 15 }, feedback: 'Above and beyond. Tenant becomes your best referral source.' },
    ]},
    { title: '📊 1031 Exchange', category: 'Analysis', description: 'You\'re selling a property with $150K in gains. A 1031 exchange defers $45K in taxes but you must buy within 180 days. Market is hot.', choices: [
      { text: 'Pay the taxes and keep the cash liquid.', effects: { equity: -45000, cashflow: 5000, reputation: 3 }, feedback: '$45K in taxes is painful but you have flexibility.' },
      { text: 'Do the 1031 into a bigger multifamily in a growing market.', effects: { equity: 120000, cashflow: 3000, properties: 1, reputation: 12 }, feedback: 'Tax-deferred growth into a better asset. Textbook move!' },
      { text: 'Rush to buy anything within 180 days.', effects: { equity: 20000, cashflow: -1000, properties: 1, reputation: -5 }, feedback: 'Bought a bad deal under time pressure. 1031 isn\'t always worth it.' },
      { text: 'Use a Delaware Statutory Trust as backup while searching for the right deal.', effects: { equity: 80000, cashflow: 2000, reputation: 10 }, feedback: 'Smart safety net. Found a great deal at day 150. Patience paid off.' },
    ]},
  ],
};

const SIDE_HUSTLES_SIM: SimConfig = {
  title: 'Hustle Master',
  icon: '🚀',
  subtitle: 'Grow your side hustle to $5K/mo profit',
  metrics: [
    { key: 'profit', label: 'Monthly Profit', icon: '💰', target: 5000, format: '$' },
    { key: 'customers', label: 'Customers', icon: '👥' },
    { key: 'time', label: 'Free Hours', icon: '⏰' },
    { key: 'reputation', label: 'Reputation', icon: '⭐' },
  ],
  winCondition: (m) => m.profit >= 5000,
  winText: 'Hustle Master! $5K/mo profit achieved!',
  loseText: "Your side hustle didn't reach profitability",
  totalRounds: 15,
  scenarios: [
    { title: '🎯 Choose Your Hustle', category: 'Strategy', description: 'You have 15 hours/week outside your day job and $2K to invest. Pick a side hustle.', choices: [
      { text: 'Start a dropshipping store.', effects: { profit: 200, customers: 20, time: -10, reputation: -3 }, feedback: 'High competition, thin margins. Making pennies after ad spend.' },
      { text: 'Freelance your professional skill on Upwork.', effects: { profit: 1500, customers: 3, time: -12, reputation: 10 }, feedback: 'High hourly rate from day 1. But you\'re trading time for money.' },
      { text: 'Create a digital product (template/course) in your niche.', effects: { profit: 500, customers: 30, time: -8, reputation: 12 }, feedback: 'Slow start but passive income scales. Smart long-term play!' },
      { text: 'Buy and flip items from thrift stores.', effects: { profit: 800, customers: 15, time: -10, reputation: 5 }, feedback: 'Decent margins but physically exhausting alongside a full-time job.' },
    ]},
    { title: '👤 First Customer', category: 'Sales', description: 'Your side hustle is live but you have zero customers. $200 marketing budget. What do you do?', choices: [
      { text: 'Run Facebook Ads targeting your ideal customer.', effects: { profit: 300, customers: 5, reputation: 3 }, feedback: '$200 gets you 5 customers. OK but expensive acquisition cost.' },
      { text: 'Post in 10 relevant online communities offering genuine help (not spam).', effects: { profit: 500, customers: 8, reputation: 12 }, feedback: 'Free and high-converting! Helpful posts get DMs. 8 customers in week 1.' },
      { text: 'Cold DM 100 people on Instagram.', effects: { profit: 100, customers: 2, time: -5, reputation: -8 }, feedback: 'Spammy. 2% conversion and you annoyed 98 people.' },
      { text: 'Ask 5 friends to be free beta customers in exchange for testimonials.', effects: { profit: 0, customers: 5, reputation: 15 }, feedback: 'No revenue yet but 5 testimonials + feedback = foundation for growth.' },
    ]},
    { title: '📈 Scaling Decision', category: 'Growth', description: 'You\'re making $1.5K/mo but working 20 hours/week. Your day job is suffering. What do you do?', choices: [
      { text: 'Quit your day job and go full-time.', effects: { profit: 500, time: 20, reputation: -5 }, feedback: 'Risky! $1.5K/mo doesn\'t replace your salary. Stress increases.' },
      { text: 'Hire a VA for $500/mo to handle operations while you focus on growth.', effects: { profit: 1000, customers: 10, time: 10, reputation: 10 }, feedback: 'Freed 10 hours/week. Used them to land 10 more customers. Smart scaling!' },
      { text: 'Raise prices 50% and accept losing some customers.', effects: { profit: 800, customers: -5, time: 5, reputation: 8 }, feedback: 'Less customers, more revenue per customer, less work. Quality over quantity.' },
      { text: 'Automate everything possible and reduce to 10 hours/week.', effects: { profit: 200, time: 10, reputation: 5 }, feedback: 'Sustainable pace but growth stalls. Systems without strategy.' },
    ]},
    { title: '⏰ Time Management', category: 'Lifestyle', description: 'It\'s 10 PM on a Tuesday. You have a client deadline tomorrow, your day job has a big meeting, and your partner is frustrated about your schedule. What do you prioritize?', choices: [
      { text: 'Pull an all-nighter for the client. Day job can wait.', effects: { profit: 500, time: -5, reputation: -8 }, feedback: 'Client happy but you bombed the meeting and your relationship is strained.' },
      { text: 'Spend 1 hour with your partner, then work until midnight on the most critical deliverable.', effects: { profit: 300, time: -2, reputation: 10 }, feedback: 'Balance isn\'t perfect but you handled all three priorities. Sustainable.' },
      { text: 'Email the client: "Need 1 extra day. Will deliver something even better."', effects: { profit: -100, time: 5, reputation: 5 }, feedback: 'Most clients are fine with this. You slept, nailed the meeting, and delivered quality.' },
      { text: 'Cancel everything and sleep. Health first.', effects: { profit: -300, customers: -1, time: 5, reputation: -3 }, feedback: 'Self-care matters but missed deadlines have consequences.' },
    ]},
    { title: '🔄 Pivot Moment', category: 'Strategy', description: 'After 4 months, your hustle is making $800/mo but growth is flat. A customer asks for a different service you never considered. Pivot?', choices: [
      { text: 'Stick to the original plan. Pivoting is quitting.', effects: { profit: 100, reputation: -3 }, feedback: 'Flat growth continues. Stubbornness isn\'t strategy.' },
      { text: 'Test the new service with 3 customers. Keep the original running.', effects: { profit: 800, customers: 5, reputation: 12 }, feedback: 'New service has 3x the demand! Gradual pivot with data. Brilliant.' },
      { text: 'Full pivot immediately. All-in on the new idea.', effects: { profit: 500, customers: -3, time: -5, reputation: 5 }, feedback: 'Lost existing customers before the new ones came. Too abrupt.' },
      { text: 'Survey your audience about what they actually need.', effects: { profit: 400, customers: 3, reputation: 10 }, feedback: 'Data collection reveals a hybrid offering. Best of both worlds.' },
    ]},
    { title: '💸 Pricing Crisis', category: 'Sales', description: 'A competitor launches the same service at half your price. Your existing customers are asking questions.', choices: [
      { text: 'Match their price. Can\'t lose customers.', effects: { profit: -600, customers: 2, reputation: -5 }, feedback: 'Race to the bottom. Profit disappears.' },
      { text: '"Here\'s why we\'re worth 2x: [specific value comparison]. Plus, here\'s a loyalty bonus for you."', effects: { profit: 300, customers: -2, reputation: 12 }, feedback: 'Lost 2 price-sensitive customers. Remaining ones are more loyal than ever.' },
      { text: 'Ignore it. Good product speaks for itself.', effects: { profit: -200, customers: -3, reputation: -3 }, feedback: 'Head in the sand. Lost 3 customers before you noticed.' },
      { text: 'Add a premium tier and a budget tier. Compete at both ends.', effects: { profit: 500, customers: 5, reputation: 10 }, feedback: 'Tiered pricing captures both segments. Revenue increases!' },
    ]},
    { title: '🤝 Partnership Offer', category: 'Growth', description: 'Another side hustler with a complementary audience (5K email list) proposes a 50/50 joint venture. Worth it?', choices: [
      { text: 'Go all-in on the JV. 50/50 everything.', effects: { profit: 600, customers: 20, reputation: 5 }, feedback: 'Good revenue but 50% is a lot for an email list you could build yourself.' },
      { text: '"Let\'s do an affiliate deal. 20% commission for every referral."', effects: { profit: 400, customers: 10, reputation: 10 }, feedback: 'They\'re incentivized but you keep control and margins. Smart.' },
      { text: '"How about a one-time cross-promotion? I promote you, you promote me."', effects: { profit: 300, customers: 15, reputation: 12 }, feedback: 'Free exchange of value. Both audiences benefit. No strings attached.' },
      { text: 'Decline. Stay independent.', effects: { reputation: -3 }, feedback: 'Missed a low-risk growth opportunity.' },
    ]},
    { title: '📱 Content Strategy', category: 'Growth', description: 'You need to build an audience for your hustle. 5 hours/week for content. Focus where?', choices: [
      { text: 'Post on every platform: TikTok, Instagram, YouTube, Twitter, LinkedIn.', effects: { customers: 5, time: -5, reputation: -3 }, feedback: 'Mediocre everywhere. Algorithms punish inconsistency.' },
      { text: 'Go all-in on one platform where your customers hang out.', effects: { customers: 20, profit: 400, reputation: 12 }, feedback: 'Became a known voice on that platform. Inbound leads every week!' },
      { text: 'Skip content. Focus on paid ads.', effects: { profit: -200, customers: 8, reputation: 3 }, feedback: 'Ads work but cost money. No organic foundation.' },
      { text: 'Start an email newsletter. Own your audience.', effects: { customers: 15, profit: 300, reputation: 10 }, feedback: 'Email is the only platform you truly own. High conversion rate.' },
    ]},
    { title: '⚡ Burnout Warning', category: 'Lifestyle', description: 'Month 6. Making $3K/mo but you\'re exhausted. Sleep is 5 hours. Social life is gone. What do you change?', choices: [
      { text: 'Push through. Success requires sacrifice.', effects: { profit: 500, time: -5, reputation: -10 }, feedback: 'Month 7: hospitalized with stress. Hustle paused for 3 months.' },
      { text: 'Cut to 10 hours/week. Systemize and delegate the rest.', effects: { profit: -200, time: 10, reputation: 12 }, feedback: 'Less money short-term but sustainable. Grew to $5K/mo by month 10.' },
      { text: 'Take a 2-week break. Come back with fresh eyes.', effects: { profit: -500, customers: -2, time: 10, reputation: 5 }, feedback: 'Rest reset your creativity. Came back with a better strategy.' },
      { text: 'Hire help for $1K/mo and reclaim 10 hours.', effects: { profit: 200, time: 8, reputation: 10 }, feedback: 'Best investment. Someone else handles operations while you strategize.' },
    ]},
    { title: '🏆 Full-Time Decision', category: 'Strategy', description: 'You\'re at $4K/mo profit. Your day job pays $5K/mo. A friend says "just quit and go full-time!" Do you?', choices: [
      { text: 'Quit now! Momentum is everything.', effects: { profit: 1000, time: 20, customers: 5, reputation: -3 }, feedback: 'Growth accelerates but no safety net. One bad month and you\'re broke.' },
      { text: 'Stay employed until side hustle hits $6K/mo for 3 consecutive months.', effects: { profit: 500, time: -2, reputation: 12 }, feedback: 'Patience + proof. When you quit, it\'s from a position of strength.' },
      { text: 'Negotiate a 4-day work week at your job. Use the extra day for the hustle.', effects: { profit: 800, time: 8, reputation: 10 }, feedback: 'Best of both worlds. Day job provides stability while hustle grows.' },
      { text: 'Save 6 months of expenses first, then quit.', effects: { profit: 300, reputation: 8 }, feedback: 'Financial cushion removes desperation. Smart runway planning.' },
    ]},
  ],
};

const BODY_LANGUAGE_SIM: SimConfig = {
  title: 'Body Language Expert',
  icon: '👁️',
  subtitle: 'Correctly read 5 social situations',
  metrics: [
    { key: 'reads', label: 'Correct Reads', icon: '✅', target: 5 },
    { key: 'awareness', label: 'Awareness', icon: '🧠' },
    { key: 'empathy', label: 'Empathy', icon: '💜' },
    { key: 'reputation', label: 'Social IQ', icon: '⭐' },
  ],
  winCondition: (m) => m.reads >= 5,
  winText: 'Body Language Expert! You read 5+ situations correctly!',
  loseText: "You misread too many social situations",
  totalRounds: 12,
  scenarios: [
    { title: '🤝 The Interview', category: 'Professional', description: 'You\'re interviewing a candidate. They maintain eye contact but keep touching their neck and their feet are pointed toward the door. What do you read?', choices: [
      { text: 'They\'re confident — great eye contact!', effects: { awareness: -10, reputation: -5 }, feedback: 'Eye contact can be rehearsed. The neck touch and foot direction signal anxiety and desire to leave.' },
      { text: 'They\'re nervous but trying to appear confident. Ask an easy question to relax them.', effects: { awareness: 20, empathy: 15, reads: 1, reputation: 10 }, feedback: 'Spot on! Self-soothing gestures + exit-oriented feet = masked nervousness. Your warmth helped them open up.' },
      { text: 'They\'re lying about something.', effects: { awareness: 5, empathy: -10, reputation: -5 }, feedback: 'Jumping to deception without more signals is premature. It was just nerves.' },
      { text: 'Nothing unusual. Standard interview behavior.', effects: { awareness: -5, reputation: -3 }, feedback: 'Missing important signals. Their discomfort was a chance to build rapport.' },
    ]},
    { title: '💼 The Meeting', category: 'Professional', description: 'In a team meeting, your colleague crosses their arms and leans back when you present your idea. But they\'re nodding. What\'s happening?', choices: [
      { text: 'They agree — they\'re nodding!', effects: { awareness: -10, reputation: -5 }, feedback: 'Nodding can be autopilot politeness. The crossed arms + lean back = evaluating or resistant.' },
      { text: 'They\'re cold. Offer to adjust the AC.', effects: { awareness: -5, empathy: 5, reputation: 3 }, feedback: 'Could be, but combined with the timing of your presentation, it\'s likely a reaction to your idea.' },
      { text: 'They\'re processing critically. Pause and ask "What concerns do you see?"', effects: { awareness: 20, empathy: 10, reads: 1, reputation: 12 }, feedback: 'Perfect read! They had 2 valid concerns. Addressing them early saved the project.' },
      { text: 'They\'re closed off. Skip them and focus on others.', effects: { awareness: 5, empathy: -15, reputation: -8 }, feedback: 'Ignoring signals instead of addressing them creates silent opposition.' },
    ]},
    { title: '❤️ The Date', category: 'Social', description: 'On a first date, your partner is leaning in, mirroring your gestures, but checking their phone under the table every few minutes.', choices: [
      { text: 'They\'re really into you — great body mirroring!', effects: { awareness: -5, reputation: -3 }, feedback: 'Mirroring is positive but the phone-checking contradicts it. Mixed signals.' },
      { text: 'They\'re bored and looking for an escape.', effects: { awareness: -5, empathy: -10, reputation: -5 }, feedback: 'Overreaction. They might just be anxious about something else.' },
      { text: 'They\'re interested but distracted by something — maybe work or a personal issue. Gently acknowledge it.', effects: { awareness: 15, empathy: 20, reads: 1, reputation: 10 }, feedback: 'Correct! They apologized — sick family member. Your empathy deepened the connection.' },
      { text: 'Say nothing and pretend not to notice.', effects: { awareness: -3, empathy: -5, reputation: -3 }, feedback: 'Ignoring the elephant in the room creates awkward tension.' },
    ]},
    { title: '🕵️ Deception Detection', category: 'Detection', description: 'Your employee says they finished the project on time, but they break eye contact, their voice pitch rises, and they give way too many details.', choices: [
      { text: 'They\'re telling the truth — lots of detail means thoroughness!', effects: { awareness: -15, reputation: -8 }, feedback: 'Over-explaining is a classic deception cue. They\'re hiding that they\'re behind.' },
      { text: 'They\'re lying. Confront them directly: "I don\'t believe you."', effects: { awareness: 10, empathy: -15, reputation: -10 }, feedback: 'Good read but terrible response. Direct accusation causes defensiveness.' },
      { text: '"Great! Can you walk me through the latest version right now?"', effects: { awareness: 20, empathy: 5, reads: 1, reputation: 12 }, feedback: 'Verification without accusation. They admit they need 2 more days. Trust preserved.' },
      { text: 'Ask a specific question about a detail to test consistency.', effects: { awareness: 15, empathy: 3, reads: 1, reputation: 8 }, feedback: 'Smart probe. Their story inconsistencies revealed the truth gently.' },
    ]},
    { title: '🎤 Presentation Feedback', category: 'Professional', description: 'You\'re watching a colleague present. Their hands are in their pockets, they\'re swaying side to side, and speaking in a monotone. Feedback time.', choices: [
      { text: '"Great job!"', effects: { awareness: -5, empathy: -5, reputation: -5 }, feedback: 'Dishonest feedback helps no one.' },
      { text: '"Your content was solid. If you use hand gestures and vary your tone, the delivery would match the content quality."', effects: { awareness: 15, empathy: 15, reads: 1, reputation: 12 }, feedback: 'Specific, actionable, and kind. They improve dramatically next time.' },
      { text: '"You looked nervous and boring."', effects: { awareness: 10, empathy: -20, reputation: -15 }, feedback: 'Accurate but brutal. They never present again.' },
      { text: '"Have you tried practicing in front of a mirror?"', effects: { awareness: 5, empathy: 5, reputation: 5 }, feedback: 'Generic advice. They need specific body language fixes.' },
    ]},
    { title: '🏢 Power Dynamics', category: 'Professional', description: 'In a negotiation, the other party spreads their papers across the table, sits with legs wide, and speaks slowly with long pauses. Read the room.', choices: [
      { text: 'They\'re disorganized and unprepared.', effects: { awareness: -15, reputation: -8 }, feedback: 'Wrong! These are deliberate power displays. Space-claiming = dominance signals.' },
      { text: 'They\'re using power postures to establish dominance. Mirror their confidence without mimicking.', effects: { awareness: 20, reads: 1, reputation: 12 }, feedback: 'Expert read! You expanded your own presence. Power balanced. Better deal achieved.' },
      { text: 'They\'re trying to intimidate you. Get aggressive back.', effects: { awareness: 10, empathy: -10, reputation: -8 }, feedback: 'Recognized the play but escalation leads to conflict, not deals.' },
      { text: 'Ignore it and focus on the numbers.', effects: { awareness: -5, reputation: 3 }, feedback: 'Content matters but so does the nonverbal chess game you\'re losing.' },
    ]},
    { title: '🍷 Read the Room', category: 'Social', description: 'You arrive at a party. The host greets you with a wide smile but tight shoulders, rapid blinking, and keeps glancing at the kitchen.', choices: [
      { text: 'They\'re happy to see you! Big smile!', effects: { awareness: -10, empathy: -5, reputation: -5 }, feedback: 'Social smiles can mask stress. The body told a different story.' },
      { text: '"Hey! Looks like you\'ve got your hands full. Can I help with anything?"', effects: { awareness: 20, empathy: 20, reads: 1, reputation: 12 }, feedback: 'Perfect! They were stressed about a kitchen disaster. Your help made their night.' },
      { text: 'They don\'t want you there. Leave early.', effects: { awareness: -5, empathy: -10, reputation: -5 }, feedback: 'Misread completely. They were just overwhelmed with hosting.' },
      { text: 'Start chatting and ignore the signals.', effects: { awareness: -3, empathy: -5, reputation: -3 }, feedback: 'Added to their stress by demanding attention when they needed help.' },
    ]},
    { title: '😰 Anxiety vs. Dishonesty', category: 'Detection', description: 'A friend borrows $500 and says they\'ll pay you back Friday. They avoid eye contact, fidget, and speak quickly. Are they lying?', choices: [
      { text: 'Definitely lying. Don\'t lend the money.', effects: { awareness: -5, empathy: -15, reputation: -8 }, feedback: 'Same cues appear in anxiety and shame. They paid you back Thursday. You misjudged.' },
      { text: 'Hard to tell — these cues overlap between anxiety and deception. Lend it but set a clear date.', effects: { awareness: 20, empathy: 10, reads: 1, reputation: 10 }, feedback: 'Correct! They were embarrassed about asking, not lying. Clear terms helped both of you.' },
      { text: 'They\'re just nervous about asking. Give them the money no questions asked.', effects: { awareness: 5, empathy: 10, reputation: 3 }, feedback: 'Empathetic but not setting terms invites problems.' },
      { text: 'Lend half and see if they pay that back first.', effects: { awareness: 10, empathy: 5, reputation: 5 }, feedback: 'Reasonable compromise but might signal distrust.' },
    ]},
    { title: '🎓 Classroom Clues', category: 'Social', description: 'You\'re training new hires. Two people in the back have glazed eyes, one is doodling, and the front row is mirroring your energy. Adapt?', choices: [
      { text: 'Keep presenting — they\'ll catch up.', effects: { awareness: -10, empathy: -5, reputation: -5 }, feedback: 'Lost 40% of your audience. They retained nothing.' },
      { text: '"Let\'s do a quick exercise. Back row — you\'re the experts now. Teach the front row what we just covered."', effects: { awareness: 20, empathy: 15, reads: 1, reputation: 12 }, feedback: 'Activation technique! Doodlers wake up, engagement hits 100%.' },
      { text: 'Call out the doodler: "Am I boring you?"', effects: { awareness: 5, empathy: -20, reputation: -15 }, feedback: 'Public shaming kills psychological safety. Nobody asks questions for the rest.' },
      { text: 'Take a 5-minute break and adjust your pace.', effects: { awareness: 10, empathy: 10, reputation: 5 }, feedback: 'Helped but didn\'t change the delivery method. Same results after break.' },
    ]},
    { title: '🤫 The Silent Treatment', category: 'Detection', description: 'Your business partner has been giving short answers, avoiding meetings, and their smile doesn\'t reach their eyes for 2 weeks. What\'s going on?', choices: [
      { text: 'They\'re busy. Don\'t overthink it.', effects: { awareness: -15, empathy: -10, reputation: -8 }, feedback: 'They were planning to leave the partnership. You missed 2 weeks of warning signs.' },
      { text: '"I\'ve noticed a shift. Is everything OK? No judgment — just want to make sure we\'re good."', effects: { awareness: 20, empathy: 20, reads: 1, reputation: 15 }, feedback: 'They opened up about feeling undervalued. One conversation saved the partnership.' },
      { text: 'Give them space. They\'ll come around.', effects: { awareness: -5, empathy: 5, reputation: -3 }, feedback: 'Space became distance. Problem festered.' },
      { text: 'Assume they\'re upset and apologize for everything.', effects: { awareness: -5, empathy: 5, reputation: -3 }, feedback: 'Apologizing without knowing the issue is confusing. Ask first.' },
    ]},
  ],
};

const AI_TOOLS_SIM: SimConfig = {
  title: 'AI Strategist',
  icon: '🤖',
  subtitle: 'Complete 5 successful AI implementations',
  metrics: [
    { key: 'implementations', label: 'Successes', icon: '✅', target: 5 },
    { key: 'efficiency', label: 'Efficiency', icon: '⚡' },
    { key: 'quality', label: 'Quality', icon: '📊' },
    { key: 'reputation', label: 'Reputation', icon: '⭐' },
  ],
  winCondition: (m) => m.implementations >= 5,
  winText: 'AI Strategist! 5 successful implementations!',
  loseText: "Your AI implementations didn't deliver",
  totalRounds: 12,
  scenarios: [
    { title: '🔧 Tool Selection', category: 'Strategy', description: 'Your marketing team needs AI for content creation. Options: ChatGPT ($20/user/mo), Claude ($20/user/mo), an open-source model (free but needs setup), or a purpose-built marketing AI ($200/mo).', choices: [
      { text: 'ChatGPT for everyone. It\'s the most popular.', effects: { efficiency: 10, quality: 5, reputation: 3 }, feedback: 'Popular ≠ best fit. Generic outputs need heavy editing.' },
      { text: 'Test all 4 for 1 week with real tasks. Pick the best performer.', effects: { efficiency: 15, quality: 15, implementations: 1, reputation: 12 }, feedback: 'Data-driven selection! The purpose-built tool won for marketing-specific tasks.' },
      { text: 'Open-source to save money.', effects: { efficiency: -10, quality: 5, reputation: -5 }, feedback: 'No one on the team can maintain it. It breaks constantly.' },
      { text: 'Purpose-built marketing AI. Pay for specialization.', effects: { efficiency: 12, quality: 12, implementations: 1, reputation: 8 }, feedback: 'Right tool for the job. Team productivity up 40%.' },
    ]},
    { title: '✍️ Prompt Engineering', category: 'Technical', description: 'Your team\'s AI outputs are generic and unusable. Everyone just types "write me a blog post about X." How do you fix it?', choices: [
      { text: '"Just be more specific in your prompts."', effects: { efficiency: -5, quality: -5, reputation: -3 }, feedback: 'Vague advice gets vague results.' },
      { text: 'Create a prompt library with templates for every use case. Train the team in a 1-hour session.', effects: { efficiency: 20, quality: 20, implementations: 1, reputation: 12 }, feedback: 'Output quality improves 70%. Team goes from frustrated to empowered!' },
      { text: 'Hire a prompt engineer at $80K/yr.', effects: { efficiency: 15, quality: 10, reputation: 5 }, feedback: 'Expensive bottleneck. One person can\'t handle all requests.' },
      { text: 'Build a custom GPT with system prompts pre-loaded for your brand voice and guidelines.', effects: { efficiency: 18, quality: 18, implementations: 1, reputation: 10 }, feedback: 'Excellent! Brand-consistent outputs without prompt expertise needed.' },
    ]},
    { title: '🔄 Automation Strategy', category: 'Strategy', description: 'Your company has 50 repetitive tasks. You could automate them with AI. Where do you start?', choices: [
      { text: 'Automate everything at once. Big bang transformation.', effects: { efficiency: -15, quality: -10, reputation: -10 }, feedback: 'Chaos. Half the automations broke. Team lost trust in AI.' },
      { text: 'Pick the 3 highest-impact, lowest-risk tasks. Automate, measure, then expand.', effects: { efficiency: 20, quality: 15, implementations: 1, reputation: 15 }, feedback: 'Quick wins build momentum. After 3 successes, the team begs you to automate more.' },
      { text: 'Let each team pick what to automate.', effects: { efficiency: 5, quality: -5, reputation: 3 }, feedback: 'No coordination. Duplicate tools, wasted budget.' },
      { text: 'Start with the CEO\'s pet task.', effects: { efficiency: 10, quality: 5, reputation: 8 }, feedback: 'Political win but not the highest impact. Still, exec buy-in helps.' },
    ]},
    { title: '⚖️ Ethical AI Use', category: 'Ethics', description: 'Your sales team is using AI to write personalized emails at scale, including fabricating personal details ("I saw your recent talk at X conference" — they didn\'t).', choices: [
      { text: 'It\'s working. Don\'t fix what ain\'t broke.', effects: { quality: -15, reputation: -20 }, feedback: 'A prospect exposes the fake personalization on LinkedIn. Viral embarrassment.' },
      { text: 'Ban AI from sales emails entirely.', effects: { efficiency: -15, quality: 5, reputation: 5 }, feedback: 'Overreaction. Threw the baby out with the bathwater.' },
      { text: 'Set guidelines: AI drafts, human verifies every fact. No fabricated details.', effects: { efficiency: 10, quality: 15, implementations: 1, reputation: 15 }, feedback: 'Perfect balance. AI speed + human truth-checking = trusted outreach.' },
      { text: '"Only use AI for follow-ups, not first contact."', effects: { efficiency: 5, quality: 10, reputation: 8 }, feedback: 'Reasonable rule but limits AI\'s potential. First contact can be AI-assisted honestly.' },
    ]},
    { title: '📊 AI for Decisions', category: 'Strategy', description: 'Your data team built an AI model that predicts customer churn with 85% accuracy. Product team wants to act on it immediately. What do you advise?', choices: [
      { text: 'Deploy it now! 85% is great.', effects: { efficiency: 10, quality: -10, reputation: -5 }, feedback: 'The 15% false positives meant bombarding loyal customers with discounts. Costly.' },
      { text: '"Let\'s A/B test: AI-guided retention vs. current process for 1 month."', effects: { efficiency: 15, quality: 15, implementations: 1, reputation: 12 }, feedback: 'Test proved AI-guided retention was 3x more effective. Confident rollout.' },
      { text: '"85% isn\'t good enough. Get it to 95% first."', effects: { efficiency: -10, quality: 5, reputation: -3 }, feedback: 'Perfect is the enemy of good. By the time it hit 95%, competitor shipped at 80%.' },
      { text: 'Use AI predictions as one input for human decision-makers, not the sole trigger.', effects: { efficiency: 12, quality: 12, implementations: 1, reputation: 10 }, feedback: 'Human-in-the-loop approach. Best of both worlds.' },
    ]},
    { title: '🎨 AI-Generated Content', category: 'Creative', description: 'Your design team is furious that you\'re considering AI image generation. "It\'ll replace us!" How do you handle it?', choices: [
      { text: '"AI is the future. Adapt or get left behind."', effects: { quality: -5, reputation: -15 }, feedback: 'Threatening your own team? Two designers quit.' },
      { text: '"AI handles the first drafts and variations. You focus on strategy, brand direction, and final polish."', effects: { efficiency: 15, quality: 15, implementations: 1, reputation: 12 }, feedback: 'Repositioned designers as directors, not executors. They love it.' },
      { text: 'Scrap AI images. Keep the team happy.', effects: { efficiency: -10, reputation: 5 }, feedback: 'Short-term peace but falling behind competitors.' },
      { text: '"Let\'s pilot it for social media thumbnails only. Designers focus on high-value brand work."', effects: { efficiency: 12, quality: 10, reputation: 10 }, feedback: 'Low-stakes pilot builds trust. Designers see AI as a tool, not a threat.' },
    ]},
    { title: '🔐 Data Privacy', category: 'Ethics', description: 'Your team is pasting customer data into ChatGPT to analyze support tickets. Fast and useful, but...', choices: [
      { text: 'Let it continue. The insights are valuable.', effects: { efficiency: 10, quality: -5, reputation: -20 }, feedback: 'Data breach risk. If audited, this violates your privacy policy.' },
      { text: 'Set up a private AI instance (Azure OpenAI) with proper data handling.', effects: { efficiency: 15, quality: 15, implementations: 1, reputation: 15 }, feedback: 'Same AI power, zero data leakage. IT and legal both approve.' },
      { text: 'Ban all AI tool usage until legal reviews.', effects: { efficiency: -20, quality: -5, reputation: 5 }, feedback: 'Legal takes 3 months. Team goes rogue with personal accounts anyway.' },
      { text: 'Anonymize the data before pasting it.', effects: { efficiency: 8, quality: 10, reputation: 8 }, feedback: 'Good interim fix but manual anonymization is error-prone.' },
    ]},
    { title: '📉 AI Failure', category: 'Technical', description: 'Your AI chatbot went live and is giving wrong answers 20% of the time. Support tickets are spiking. What do you do?', choices: [
      { text: 'Shut it down immediately.', effects: { efficiency: -15, quality: 5, reputation: -5 }, feedback: 'Panic response. You could have fixed it without going fully offline.' },
      { text: 'Add a confidence threshold: only auto-respond when >90% confident, route everything else to humans.', effects: { efficiency: 10, quality: 15, implementations: 1, reputation: 12 }, feedback: 'Smart hybrid! Error rate drops to 3% while maintaining speed.' },
      { text: '"20% is acceptable for a v1. Keep it running."', effects: { efficiency: 5, quality: -15, reputation: -12 }, feedback: 'Customers don\'t care about your version number. They care about accuracy.' },
      { text: 'A/B test: 50% get chatbot, 50% get humans. Compare satisfaction.', effects: { efficiency: 8, quality: 10, reputation: 8 }, feedback: 'Data shows chatbot is fine for simple questions. Humans needed for complex ones.' },
    ]},
    { title: '🧪 AI Experimentation', category: 'Creative', description: 'Your CEO asks: "How should we use AI?" You have 100 different ideas. How do you prioritize?', choices: [
      { text: 'Present all 100 ideas in a 50-page document.', effects: { efficiency: -5, quality: -5, reputation: -8 }, feedback: 'CEO fell asleep on page 3. Prioritization IS the skill.' },
      { text: '"Here are 3 ideas ranked by impact vs. effort. Let\'s fund the top one for 30 days."', effects: { efficiency: 20, quality: 15, implementations: 1, reputation: 15 }, feedback: 'Clarity + action bias. CEO approves immediately. Results in 30 days.' },
      { text: '"Let\'s hire an AI consultancy to figure it out."', effects: { efficiency: -5, quality: 5, reputation: -3 }, feedback: 'Consultants take 3 months and charge $50K for the same 3 ideas.' },
      { text: '"Let every department run their own AI experiments."', effects: { efficiency: 5, quality: -5, reputation: 3 }, feedback: 'Innovation is great but without coordination it\'s chaos.' },
    ]},
    { title: '🔮 Future-Proofing', category: 'Strategy', description: 'AI is evolving fast. Your AI strategy might be outdated in 6 months. How do you build for change?', choices: [
      { text: 'Lock into a 2-year contract with one AI vendor for the best price.', effects: { efficiency: -10, quality: -5, reputation: -5 }, feedback: 'Locked in with a vendor that falls behind 8 months later.' },
      { text: 'Build vendor-agnostic architecture. Use abstraction layers so you can swap AI providers.', effects: { efficiency: 15, quality: 15, implementations: 1, reputation: 12 }, feedback: 'When GPT-5 drops, you switch in 1 day while competitors take months.' },
      { text: 'Wait for the market to stabilize before investing.', effects: { efficiency: -15, reputation: -8 }, feedback: 'Waiting is losing. Competitors build while you watch.' },
      { text: 'Invest in training your team to evaluate new AI tools quarterly.', effects: { efficiency: 10, quality: 10, reputation: 10 }, feedback: 'Adaptable team > any single tool. Skills compound.' },
    ]},
  ],
};

const CODING_SIM: SimConfig = {
  title: 'Tech Lead',
  icon: '💻',
  subtitle: 'Ship 4 successful projects without major incidents',
  metrics: [
    { key: 'shipped', label: 'Shipped', icon: '🚀', target: 4 },
    { key: 'quality', label: 'Code Quality', icon: '📊' },
    { key: 'velocity', label: 'Velocity', icon: '⚡' },
    { key: 'reputation', label: 'Team Trust', icon: '⭐' },
  ],
  winCondition: (m) => m.shipped >= 4,
  winText: 'Tech Lead! 4 successful projects shipped!',
  loseText: "Too many incidents or delayed projects",
  totalRounds: 15,
  scenarios: [
    { title: '🏗️ Architecture Decision', category: 'Architecture', description: 'New project: real-time dashboard for 10K concurrent users. Team debates: microservices vs. monolith?', choices: [
      { text: 'Microservices from day 1. Gotta scale!', effects: { velocity: -15, quality: 5, reputation: -5 }, feedback: 'Over-engineered for 10K users. Team spent 3 months on infrastructure instead of features.' },
      { text: 'Start monolith with clear module boundaries. Extract services when needed.', effects: { velocity: 20, quality: 15, shipped: 1, reputation: 12 }, feedback: 'Shipped in 6 weeks. Clean architecture makes future extraction easy.' },
      { text: 'Serverless functions for everything.', effects: { velocity: 5, quality: -10, reputation: -5 }, feedback: 'Cold starts killed the real-time experience. Wrong tool for the job.' },
      { text: '"Let\'s prototype both for 1 week and benchmark."', effects: { velocity: 10, quality: 10, reputation: 8 }, feedback: 'Data-driven decision. Monolith won on velocity. Team aligned.' },
    ]},
    { title: '🐛 Production Bug', category: 'Debugging', description: 'Friday 5 PM. Users report data loss. Error logs show intermittent database timeout. On-call engineer says "Let\'s just restart the server."', choices: [
      { text: 'Restart and go home. It\'s Friday.', effects: { quality: -20, reputation: -15 }, feedback: 'Bug came back Saturday at 3 AM. Now you\'re debugging while exhausted.' },
      { text: 'Investigate: check connection pool, query performance, and recent deployments.', effects: { quality: 15, velocity: 5, shipped: 1, reputation: 12 }, feedback: 'Found a N+1 query from Thursday\'s deploy. Hotfixed in 30 minutes. Data safe.' },
      { text: 'Roll back Thursday\'s deployment.', effects: { quality: 10, velocity: -5, reputation: 5 }, feedback: 'Safe choice. Data loss stops. But you still need to find and fix the root cause.' },
      { text: 'Page the whole team for an incident response.', effects: { quality: 5, velocity: -10, reputation: -5 }, feedback: 'Overkill for this issue. Team is annoyed at a Friday evening page.' },
    ]},
    { title: '📝 Code Review', category: 'Quality', description: 'Junior dev submits a PR. It works but: no tests, 500-line function, hardcoded values, no error handling. Ship it?', choices: [
      { text: 'Approve it. We\'re behind schedule.', effects: { velocity: 10, quality: -20, reputation: -10 }, feedback: 'Shipped with bugs. 3 production incidents this week. Schedule is even further behind.' },
      { text: 'Block with detailed feedback. Explain the "why" for each concern. Pair on the refactor.', effects: { velocity: -5, quality: 20, shipped: 1, reputation: 15 }, feedback: 'Junior dev levels up. Clean code ships 2 days later. Long-term velocity increases.' },
      { text: '"I\'ll just rewrite it myself."', effects: { velocity: 5, quality: 10, reputation: -12 }, feedback: 'Code is better but the junior learned nothing. And they\'re demoralized.' },
      { text: '"Split this into 3 smaller PRs and add tests for the critical path only."', effects: { velocity: 5, quality: 15, reputation: 10 }, feedback: 'Pragmatic compromise. Tests where it matters, shipped incrementally.' },
    ]},
    { title: '⚙️ Tech Stack Choice', category: 'Architecture', description: 'New mobile app project. Team is split: React Native (team knows it) vs. Flutter (better performance) vs. Native (best UX). Budget: 3 months.', choices: [
      { text: 'React Native. Ship with what the team knows.', effects: { velocity: 15, quality: 10, shipped: 1, reputation: 8 }, feedback: 'Shipped on time! Performance is good enough. Known stack = fewer surprises.' },
      { text: 'Flutter. Invest in learning for better long-term.', effects: { velocity: -10, quality: 5, reputation: -3 }, feedback: 'Learning curve blew the timeline. Shipped 2 months late.' },
      { text: 'Native for both platforms.', effects: { velocity: -20, quality: 15, reputation: -5 }, feedback: 'Two codebases, one team, 3-month budget? Impossible. Shipped 4 months late.' },
      { text: 'React Native for MVP. Rewrite critical screens natively if performance requires it.', effects: { velocity: 12, quality: 12, shipped: 1, reputation: 10 }, feedback: 'Pragmatic approach. Shipped fast, optimized only the 2 screens that needed it.' },
    ]},
    { title: '⏰ Deadline Crunch', category: 'Management', description: 'Demo day is in 3 days. You\'re 5 days behind. Stakeholders don\'t know yet. What do you do?', choices: [
      { text: 'Tell the team to work nights and weekends to catch up.', effects: { velocity: 5, quality: -15, reputation: -15 }, feedback: 'Shipped a buggy demo. Team is burned out and resentful.' },
      { text: 'Tell stakeholders now. Propose a reduced-scope demo with the most impressive features.', effects: { velocity: 5, quality: 10, shipped: 1, reputation: 12 }, feedback: 'Stakeholders respect the transparency. Focused demo wows them more than a buggy full version.' },
      { text: 'Skip the demo and ask for 2 more weeks.', effects: { velocity: -10, reputation: -10 }, feedback: 'Lost stakeholder confidence. They question your project management.' },
      { text: 'Ship what\'s ready. Mock the rest with hardcoded data.', effects: { velocity: 10, quality: -10, reputation: 5 }, feedback: 'Demo looks good but someone clicks a mock button. Awkward.' },
    ]},
    { title: '🔒 Security vs Speed', category: 'Quality', description: 'You\'re about to launch. Security audit finds a medium-severity vulnerability. Fix takes 2 weeks. Launch is Monday.', choices: [
      { text: 'Launch anyway. Medium severity is fine.', effects: { velocity: 10, quality: -20, reputation: -15 }, feedback: 'Vulnerability exploited 3 days after launch. Data breach. Career-defining mistake.' },
      { text: 'Delay launch 2 weeks. Fix the vulnerability properly.', effects: { velocity: -10, quality: 15, shipped: 1, reputation: 10 }, feedback: 'Stakeholders grumble but you shipped securely. No incidents.' },
      { text: 'Launch with a WAF rule as a temporary mitigation. Fix in sprint 2.', effects: { velocity: 5, quality: 10, shipped: 1, reputation: 12 }, feedback: 'Smart compromise! Launched on time with mitigation. Proper fix shipped in 10 days.' },
      { text: 'Ask the security team to retest — maybe it\'s a false positive.', effects: { velocity: -5, quality: -5, reputation: -5 }, feedback: 'It wasn\'t a false positive. Wasted time on denial.' },
    ]},
    { title: '🧪 Testing Strategy', category: 'Quality', description: 'The team writes zero tests. "We don\'t have time for tests." How do you introduce testing culture?', choices: [
      { text: 'Mandate 100% code coverage immediately.', effects: { velocity: -20, quality: 5, reputation: -10 }, feedback: 'Team writes useless tests to hit the number. Worse than no tests.' },
      { text: '"Let\'s add tests only for the 5 most critical paths. 30 minutes max per PR."', effects: { velocity: 5, quality: 15, shipped: 1, reputation: 12 }, feedback: 'Critical bugs caught before production. Team sees the value. Testing expands organically.' },
      { text: 'Hire a QA engineer.', effects: { velocity: -5, quality: 10, reputation: 5 }, feedback: 'QA helps but devs still ship untested code over the wall.' },
      { text: 'Set up CI/CD with automated test requirements. No merge without passing tests.', effects: { velocity: -5, quality: 12, reputation: 8 }, feedback: 'Infrastructure-first approach. Forces the habit. Good long-term.' },
    ]},
    { title: '📚 Tech Debt', category: 'Architecture', description: 'The codebase has 2 years of tech debt. Everything takes 3x longer than it should. Sprint planning is painful. How do you address it?', choices: [
      { text: 'Stop everything. 2-month rewrite.', effects: { velocity: -20, quality: 10, reputation: -10 }, feedback: 'No features for 2 months? Business says no. Rewrite cancelled at month 1.' },
      { text: 'Allocate 20% of each sprint to tech debt. Prioritize debt that blocks feature work.', effects: { velocity: 15, quality: 15, shipped: 1, reputation: 12 }, feedback: 'Steady improvement. After 3 sprints, feature velocity doubles.' },
      { text: '"Just write clean code going forward."', effects: { velocity: -5, quality: 5, reputation: -3 }, feedback: 'New code is clean but the old mess drags everything down.' },
      { text: 'Identify the 3 worst files. Refactor those first.', effects: { velocity: 10, quality: 10, reputation: 8 }, feedback: '80/20 rule applied! 3 files caused 60% of bugs. Huge improvement.' },
    ]},
    { title: '👥 Hiring Decision', category: 'Management', description: 'You need a senior developer. Candidate A: perfect technical skills, arrogant in interview. Candidate B: strong skills, great collaborator, less experience.', choices: [
      { text: 'Hire A. Skills are what matter.', effects: { velocity: 5, quality: 5, reputation: -15 }, feedback: 'Brilliant code but team morale tanks. Two people quit in 3 months.' },
      { text: 'Hire B. Culture add over culture fit.', effects: { velocity: 5, quality: 10, shipped: 1, reputation: 15 }, feedback: 'B levels up fast. Team collaboration improves. Best hire you\'ve made.' },
      { text: 'Hire both.', effects: { velocity: 10, quality: 5, reputation: -5 }, feedback: 'A and B clash. You spend more time managing conflict than shipping.' },
      { text: 'Keep looking. Neither is perfect.', effects: { velocity: -10, reputation: -5 }, feedback: 'Position open for 3 months. Team is overworked.' },
    ]},
    { title: '🌐 API Design', category: 'Architecture', description: 'Building a public API. Team debates: REST vs. GraphQL vs. gRPC. Your clients are web + mobile apps.', choices: [
      { text: 'REST. Simple, everyone knows it.', effects: { velocity: 10, quality: 8, shipped: 1, reputation: 5 }, feedback: 'Shipped fast. Mobile team complains about over-fetching but it works.' },
      { text: 'GraphQL. Mobile gets exactly what it needs.', effects: { velocity: -5, quality: 12, reputation: 8 }, feedback: 'Learning curve for the team but mobile performance is excellent.' },
      { text: 'REST for now with a GraphQL gateway planned for v2.', effects: { velocity: 12, quality: 12, shipped: 1, reputation: 12 }, feedback: 'Ship fast, optimize later. Both teams happy with the roadmap.' },
      { text: 'gRPC for everything. Maximum performance.', effects: { velocity: -15, quality: 5, reputation: -5 }, feedback: 'Browser support is painful. Web team spends weeks on workarounds.' },
    ]},
    { title: '💣 Incident Response', category: 'Debugging', description: 'Production is down. 500 errors everywhere. Last deploy was 6 hours ago. Multiple changes merged.', choices: [
      { text: 'Git blame and find who broke it.', effects: { velocity: -10, quality: -5, reputation: -15 }, feedback: 'Blame game wastes time. Site was down for 45 minutes.' },
      { text: 'Immediate rollback to last known good version. Investigate in staging.', effects: { velocity: 10, quality: 10, shipped: 1, reputation: 12 }, feedback: 'Site up in 3 minutes. Root cause found in staging without pressure. Textbook response.' },
      { text: 'Read the error logs first. Find the exact issue.', effects: { velocity: 5, quality: 8, reputation: 5 }, feedback: 'Found it in 15 minutes. Not bad, but 15 minutes of downtime is expensive.' },
      { text: 'Restart all services. That usually works.', effects: { velocity: -5, quality: -10, reputation: -8 }, feedback: 'Restart masks the problem. It crashes again in 2 hours.' },
    ]},
    { title: '🔀 Merge Conflict', category: 'Management', description: 'Two senior devs have opposing PRs that solve the same problem differently. Both refuse to back down. The feature is blocking a release.', choices: [
      { text: 'Pick the one with more seniority.', effects: { quality: 5, reputation: -12 }, feedback: 'The other dev feels politics beat merit. Starts looking for a new job.' },
      { text: '"Let\'s evaluate both against our technical criteria: performance, maintainability, test coverage."', effects: { velocity: 5, quality: 15, shipped: 1, reputation: 12 }, feedback: 'Objective evaluation. Clear winner. Both devs respect the process.' },
      { text: 'Merge both and let users A/B test.', effects: { velocity: -10, quality: -5, reputation: -3 }, feedback: 'Over-engineered solution for an ego problem.' },
      { text: 'Combine the best parts of both approaches.', effects: { velocity: -5, quality: 12, reputation: 8 }, feedback: 'Hybrid works but took extra time. Both feel heard.' },
    ]},
  ],
};

function generateSimConfig(skillName: string): SimConfig {
  if (skillName === 'Sales') return SALES_SIM;
  if (skillName === 'Business') return BUSINESS_SIM;
  if (skillName === 'Negotiation') return NEGOTIATION_SIM;
  if (skillName === 'Marketing Agency') return MARKETING_AGENCY_SIM;
  if (skillName === 'Persuasion') return PERSUASION_SIM;
  if (skillName === 'Real Estate') return REAL_ESTATE_SIM;
  if (skillName === 'Side Hustles') return SIDE_HUSTLES_SIM;
  if (skillName === 'Body Language') return BODY_LANGUAGE_SIM;
  if (skillName === 'AI Tools') return AI_TOOLS_SIM;
  if (skillName === 'Coding') return CODING_SIM;
  // Default: generic decision sim
  return {
    ...BUSINESS_SIM,
    title: `Master ${skillName}`,
    subtitle: `Complete the ${skillName} challenge`,
  };
}

// Helper to format effect changes as consequence text
function formatEffectChanges(effects: Record<string, number>, metricLabels: Record<string, string>): string[] {
  const parts: string[] = [];
  for (const [key, val] of Object.entries(effects)) {
    if (val === 0) continue;
    const label = metricLabels[key] || key;
    const sign = val > 0 ? '+' : '';
    const formatted = (key === 'cash' || key === 'revenue') ? `${sign}$${Math.abs(val).toLocaleString()}` : `${sign}${val}`;
    parts.push(`${label} ${formatted}`);
  }
  return parts;
}

export function MasterSimScreen({ navigation, route }: { navigation: any; route: any }) {
  const { skillName } = route.params;
  const config = generateSimConfig(skillName);

  const [round, setRound] = useState(0);
  const [metrics, setMetrics] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    config.metrics.forEach(m => {
      if (m.key === 'cash') init[m.key] = 50000;
      else if (m.key === 'trust') init[m.key] = 50;
      else if (m.key === 'morale') init[m.key] = 70;
      else if (m.key === 'prospects') init[m.key] = 5;
      else if (m.key === 'reputation') init[m.key] = 50;
      else if (m.key === 'leverage') init[m.key] = 50;
      else if (m.key === 'influence') init[m.key] = 50;
      else if (m.key === 'credibility') init[m.key] = 50;
      else if (m.key === 'awareness') init[m.key] = 50;
      else if (m.key === 'empathy') init[m.key] = 50;
      else if (m.key === 'efficiency') init[m.key] = 50;
      else if (m.key === 'quality') init[m.key] = 50;
      else if (m.key === 'velocity') init[m.key] = 50;
      else if (m.key === 'time') init[m.key] = 15;
      else init[m.key] = 0;
    });
    return init;
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackGood, setFeedbackGood] = useState(false);
  const [lastEffects, setLastEffects] = useState<Record<string, number> | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [won, setWon] = useState(false);
  const [shuffledChoices, setShuffledChoices] = useState<Choice[]>([]);
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [startTime] = useState(Date.now());
  const [performanceScore, setPerformanceScore] = useState(0);

  // Build metric label map for consequence text
  const metricLabels: Record<string, string> = {};
  config.metrics.forEach(m => { metricLabels[m.key] = m.label; });

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const consequenceAnim = useRef(new Animated.Value(0)).current;
  const reputationAnim = useRef(new Animated.Value(0)).current;

  const scenario = config.scenarios[round % config.scenarios.length];

  // Shuffle choices on each round
  useEffect(() => {
    const shuffled = [...scenario.choices].sort(() => Math.random() - 0.5);
    setShuffledChoices(shuffled);
    // Entrance animation
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    consequenceAnim.setValue(0);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [round]);

  const handleChoice = useCallback((choice: Choice) => {
    // Apply effects
    setMetrics(prev => {
      const next = { ...prev };
      Object.entries(choice.effects).forEach(([key, val]) => {
        next[key] = (next[key] || 0) + val;
      });
      return next;
    });

    // Calculate score impact
    const totalEffect = Object.values(choice.effects).reduce((s, v) => s + v, 0);
    const scoreImpact = totalEffect > 0 ? Math.min(totalEffect / 100, 30) : Math.max(totalEffect / 100, -20);
    setPerformanceScore(prev => prev + scoreImpact);

    // Record decision
    const record: DecisionRecord = {
      round: round + 1,
      scenarioTitle: scenario.title,
      category: scenario.category,
      choiceText: choice.text,
      feedback: choice.feedback,
      scoreImpact,
      timestamp: Date.now(),
    };
    setDecisions(prev => [...prev, record]);

    // Set last effects for consequence display
    setLastEffects(choice.effects);
    setFeedbackGood(totalEffect > 0);
    setFeedback(choice.feedback);

    // Animate consequence text
    consequenceAnim.setValue(0);
    Animated.timing(consequenceAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Animate reputation bar
    if (choice.effects.reputation || choice.effects.trust) {
      reputationAnim.setValue(1);
      Animated.timing(reputationAnim, { toValue: 0, duration: 800, useNativeDriver: true }).start();
    }

    try {
      Haptics.notificationAsync(
        totalEffect > 0
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error
      );
    } catch {}

    // Check end
    setTimeout(() => {
      const newMetrics = { ...metrics };
      Object.entries(choice.effects).forEach(([key, val]) => {
        newMetrics[key] = (newMetrics[key] || 0) + val;
      });

      if (config.winCondition(newMetrics)) {
        setWon(true);
        setShowResult(true);
      } else if (round >= config.totalRounds - 1) {
        setWon(false);
        setShowResult(true);
      } else {
        setFeedback(null);
        setLastEffects(null);
        setRound(prev => prev + 1);
      }
    }, 2500);
  }, [round, metrics, config]);

  // Compute detailed stats for result screen
  const getDetailedStats = () => {
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    const goodDecisions = decisions.filter(d => d.scoreImpact > 0).length;
    const badDecisions = decisions.filter(d => d.scoreImpact < 0).length;
    const neutralDecisions = decisions.filter(d => d.scoreImpact === 0).length;

    const bestMoment = decisions.length > 0
      ? decisions.reduce((best, d) => d.scoreImpact > best.scoreImpact ? d : best, decisions[0])
      : null;
    const worstMoment = decisions.length > 0
      ? decisions.reduce((worst, d) => d.scoreImpact < worst.scoreImpact ? d : worst, decisions[0])
      : null;

    // Category breakdown
    const categoryScores: Record<string, { total: number; count: number }> = {};
    decisions.forEach(d => {
      if (!categoryScores[d.category]) categoryScores[d.category] = { total: 0, count: 0 };
      categoryScores[d.category].total += d.scoreImpact;
      categoryScores[d.category].count += 1;
    });

    const bestCategory = Object.entries(categoryScores).sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0];
    const worstCategory = Object.entries(categoryScores).sort((a, b) => (a[1].total / a[1].count) - (b[1].total / b[1].count))[0];

    return {
      timeStr,
      totalDecisions: decisions.length,
      goodDecisions,
      badDecisions,
      neutralDecisions,
      bestMoment,
      worstMoment,
      bestCategory: bestCategory ? bestCategory[0] : null,
      worstCategory: worstCategory ? worstCategory[0] : null,
      finalScore: Math.round(performanceScore),
    };
  };

  // Compute reputation bar width
  const reputationKey = config.metrics.find(m => m.key === 'reputation' || m.key === 'trust');
  const reputationValue = reputationKey ? (metrics[reputationKey.key] || 0) : 0;
  const reputationMax = 100;
  const reputationPct = Math.max(0, Math.min(100, (reputationValue / reputationMax) * 100));
  const reputationColor = reputationPct > 60 ? colors.success : reputationPct > 30 ? '#F59E0B' : colors.error;

  // Result screen
  if (showResult) {
    const stats = getDetailedStats();
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.resultContainer}>
            <Text style={{ fontSize: 60, marginBottom: 16 }}>{won ? '🏆' : '💀'}</Text>
            <Text style={styles.resultTitle}>{won ? config.title : 'Challenge Failed'}</Text>
            <Text style={styles.resultSub}>{won ? config.winText : config.loseText}</Text>

            {/* Performance Score */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabelText}>Performance Score</Text>
              <Text style={[styles.scoreBigNumber, { color: stats.finalScore >= 0 ? colors.success : colors.error }]}>
                {stats.finalScore >= 0 ? '+' : ''}{stats.finalScore}
              </Text>
            </View>

            {/* Quick Stats Row */}
            <View style={styles.quickStatsRow}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>{stats.totalDecisions}</Text>
                <Text style={styles.quickStatLabel}>Decisions</Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={[styles.quickStatValue, { color: colors.success }]}>{stats.goodDecisions}</Text>
                <Text style={styles.quickStatLabel}>Good</Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={[styles.quickStatValue, { color: colors.error }]}>{stats.badDecisions}</Text>
                <Text style={styles.quickStatLabel}>Bad</Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>{stats.timeStr}</Text>
                <Text style={styles.quickStatLabel}>Time</Text>
              </View>
            </View>

            {/* Final Metrics */}
            <Text style={styles.sectionTitle}>Final Metrics</Text>
            <View style={styles.resultMetrics}>
              {config.metrics.map(m => (
                <View key={m.key} style={styles.resultMetricRow}>
                  <Text style={styles.resultMetricLabel}>{m.icon} {m.label}</Text>
                  <Text style={[styles.resultMetricValue, m.target && metrics[m.key] >= m.target ? { color: colors.success } : null]}>
                    {m.format === '$' ? '$' : ''}{(metrics[m.key] || 0).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>

            {/* Best & Worst Moments */}
            {stats.bestMoment && (
              <>
                <Text style={styles.sectionTitle}>Best Moment</Text>
                <View style={[styles.momentCard, { borderLeftColor: colors.success }]}>
                  <Text style={styles.momentTitle}>{stats.bestMoment.scenarioTitle}</Text>
                  <Text style={styles.momentFeedback}>{stats.bestMoment.feedback}</Text>
                </View>
              </>
            )}
            {stats.worstMoment && stats.worstMoment.scoreImpact < 0 && (
              <>
                <Text style={styles.sectionTitle}>Worst Moment</Text>
                <View style={[styles.momentCard, { borderLeftColor: colors.error }]}>
                  <Text style={styles.momentTitle}>{stats.worstMoment.scenarioTitle}</Text>
                  <Text style={styles.momentFeedback}>{stats.worstMoment.feedback}</Text>
                </View>
              </>
            )}

            {/* Category Strengths */}
            {stats.bestCategory && stats.worstCategory && stats.bestCategory !== stats.worstCategory && (
              <>
                <Text style={styles.sectionTitle}>Skill Breakdown</Text>
                <View style={styles.categoryRow}>
                  <View style={[styles.categoryTag, { backgroundColor: 'rgba(52,211,153,0.15)' }]}>
                    <Text style={[styles.categoryTagText, { color: colors.success }]}>Strong: {stats.bestCategory}</Text>
                  </View>
                  <View style={[styles.categoryTag, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                    <Text style={[styles.categoryTagText, { color: colors.error }]}>Improve: {stats.worstCategory}</Text>
                  </View>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.resultBtn, { marginTop: 24 }]}
              onPress={() => {
                if (won) {
                  navigation.goBack();
                } else {
                  setRound(0);
                  setMetrics(() => {
                    const init: Record<string, number> = {};
                    config.metrics.forEach(m => {
                      if (m.key === 'cash') init[m.key] = 50000;
                      else if (m.key === 'trust') init[m.key] = 50;
                      else if (m.key === 'morale') init[m.key] = 70;
                      else if (m.key === 'prospects') init[m.key] = 5;
                      else if (m.key === 'reputation') init[m.key] = 50;
                      else if (m.key === 'leverage') init[m.key] = 50;
                      else if (m.key === 'influence') init[m.key] = 50;
                      else if (m.key === 'credibility') init[m.key] = 50;
                      else if (m.key === 'awareness') init[m.key] = 50;
                      else if (m.key === 'empathy') init[m.key] = 50;
                      else if (m.key === 'efficiency') init[m.key] = 50;
                      else if (m.key === 'quality') init[m.key] = 50;
                      else if (m.key === 'velocity') init[m.key] = 50;
                      else if (m.key === 'time') init[m.key] = 15;
                      else init[m.key] = 0;
                    });
                    return init;
                  });
                  setShowResult(false);
                  setWon(false);
                  setFeedback(null);
                  setLastEffects(null);
                  setDecisions([]);
                  setPerformanceScore(0);
                }
              }}
            >
              <LinearGradient
                colors={won ? [colors.primary, '#E55A2B'] : [colors.error, '#B91C1C']}
                style={styles.resultBtnGradient}
              >
                <Text style={styles.resultBtnText}>{won ? 'Complete' : 'Try Again'}</Text>
              </LinearGradient>
            </TouchableOpacity>
            {!won && (
              <TouchableOpacity style={{ marginTop: 16 }} onPress={() => navigation.goBack()}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Back to lessons</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{config.icon} {config.title}</Text>
        <Text style={styles.roundText}>{round + 1}/{config.totalRounds}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <LinearGradient
          colors={[colors.primary, colors.success]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${((round + 1) / config.totalRounds) * 100}%` }]}
        />
      </View>

      {/* Reputation / Relationship Bar */}
      {reputationKey && (
        <View style={styles.reputationContainer}>
          <View style={styles.reputationHeader}>
            <Text style={styles.reputationLabel}>
              {reputationKey.icon} {reputationKey.key === 'reputation' ? 'Reputation' : 'Relationship'}
            </Text>
            <Text style={[styles.reputationValue, { color: reputationColor }]}>
              {Math.round(reputationValue)}/{reputationMax}
            </Text>
          </View>
          <View style={styles.reputationBarBg}>
            <Animated.View style={[
              styles.reputationBarFill,
              {
                width: `${reputationPct}%`,
                backgroundColor: reputationColor,
                opacity: Animated.add(0.8, Animated.multiply(reputationAnim, 0.2)),
              },
            ]} />
          </View>
        </View>
      )}

      {/* Running Score */}
      <View style={styles.runningScoreRow}>
        <View style={styles.runningScoreBadge}>
          <Text style={styles.runningScoreLabel}>Score</Text>
          <Text style={[styles.runningScoreValue, { color: performanceScore >= 0 ? colors.success : colors.error }]}>
            {performanceScore >= 0 ? '+' : ''}{Math.round(performanceScore)}
          </Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{scenario.category}</Text>
        </View>
      </View>

      {/* Metrics */}
      <View style={styles.metricsRow}>
        {config.metrics.filter(m => m.key !== 'reputation').map(m => (
          <View key={m.key} style={styles.metricBox}>
            <Text style={styles.metricIcon}>{m.icon}</Text>
            <Text style={[styles.metricValue, m.target && metrics[m.key] >= m.target ? { color: colors.success } : null]}>
              {m.format === '$' ? '$' : ''}{(metrics[m.key] || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      {/* Scenario */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.scenarioCard}>
            <Text style={styles.scenarioTitle}>{scenario.title}</Text>
            <Text style={styles.scenarioDesc}>{scenario.description}</Text>
          </View>

          {/* Choices */}
          {!feedback && shuffledChoices.map((choice, i) => (
            <TouchableOpacity
              key={i}
              style={styles.choiceBtn}
              activeOpacity={0.7}
              onPress={() => handleChoice(choice)}
            >
              <Text style={styles.choiceLetter}>{String.fromCharCode(65 + i)}</Text>
              <Text style={styles.choiceText}>{choice.text}</Text>
            </TouchableOpacity>
          ))}

          {/* Feedback + Consequence */}
          {feedback && (
            <Animated.View style={{ opacity: consequenceAnim }}>
              <View style={[styles.feedbackCard, feedbackGood ? styles.feedbackGood : styles.feedbackBad]}>
                <Text style={styles.feedbackIcon}>{feedbackGood ? '✓' : '✗'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.feedbackText}>{feedback}</Text>
                  {lastEffects && (
                    <View style={styles.consequenceRow}>
                      {formatEffectChanges(lastEffects, metricLabels).map((txt, i) => {
                        const isPositive = txt.includes('+');
                        return (
                          <View key={i} style={[styles.consequenceTag, { backgroundColor: isPositive ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)' }]}>
                            <Text style={[styles.consequenceText, { color: isPositive ? colors.success : colors.error }]}>{txt}</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  roundText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: spacing.md,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: { height: '100%', borderRadius: 2 },
  // Reputation bar
  reputationContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: 4,
  },
  reputationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  reputationLabel: { fontSize: 10, fontWeight: '600', color: colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase' },
  reputationValue: { fontSize: 11, fontWeight: '800' },
  reputationBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  reputationBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Running score
  runningScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: 4,
    marginTop: 4,
  },
  runningScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  runningScoreLabel: { fontSize: 10, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  runningScoreValue: { fontSize: 14, fontWeight: '900' },
  categoryBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: { fontSize: 10, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  // Metrics
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 4,
    marginBottom: 4,
  },
  metricBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  metricIcon: { fontSize: 16, marginBottom: 2 },
  metricValue: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  metricLabel: { fontSize: 8, color: colors.textSecondary, marginTop: 1, fontWeight: '500' },
  scenarioCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  scenarioTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  scenarioDesc: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  choiceLetter: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    width: 28,
    height: 28,
    textAlign: 'center',
    lineHeight: 28,
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  choiceText: { fontSize: 14, color: colors.textPrimary, flex: 1, lineHeight: 20 },
  feedbackCard: {
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  feedbackGood: { backgroundColor: 'rgba(52,211,153,0.15)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)' },
  feedbackBad: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  feedbackIcon: { fontSize: 24, fontWeight: '900' },
  feedbackText: { fontSize: 14, color: colors.textPrimary, flex: 1, lineHeight: 20 },
  // Consequence tags
  consequenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  consequenceTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  consequenceText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // Results
  resultContainer: { alignItems: 'center', justifyContent: 'center', padding: 24, paddingTop: 40 },
  resultTitle: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, marginBottom: 8 },
  resultSub: { fontSize: 15, color: colors.textSecondary, marginBottom: 20, textAlign: 'center' },
  scoreCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  scoreLabelText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  scoreBigNumber: { fontSize: 48, fontWeight: '900' },
  quickStatsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginBottom: 20,
  },
  quickStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  quickStatValue: { fontSize: 18, fontWeight: '900', color: colors.textPrimary, marginBottom: 2 },
  quickStatLabel: { fontSize: 9, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 8,
  },
  resultMetrics: { width: '100%', gap: 6, marginBottom: 12 },
  resultMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 14,
    borderRadius: 10,
  },
  resultMetricLabel: { fontSize: 14, color: colors.textSecondary },
  resultMetricValue: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  momentCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    width: '100%',
    marginBottom: 8,
  },
  momentTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  momentFeedback: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginBottom: 8,
  },
  categoryTag: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  categoryTagText: { fontSize: 12, fontWeight: '700' },
  resultBtn: { width: '100%' },
  resultBtnGradient: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  resultBtnText: { fontSize: 18, fontWeight: '900', color: '#fff' },
});
