import { ArrowRight, BarChart3, Bot, Globe, Target, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7C3AED] rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F97316] rounded-full blur-[128px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-[#7C3AED] mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7C3AED] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7C3AED]"></span>
            </span>
            <span>Now in Public Beta</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            Stop Sending Cold Emails.<br />
            Send <span className="text-[#7C3AED]">Live Website Demos</span> Instead.
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
            myleadbots generates personalized, live website demos for 100+ prospects and reaches them on Email, Instagram, and Facebook automatically.
            Close 3x more deals without the cold email grind.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-4 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-bold rounded-xl transition-all hover:scale-105"
            >
              Generate Your First 10 Leads Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#demo"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all"
            >
              Watch 2-Min Demo
            </Link>
          </div>

          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent z-10" />
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-4xl mx-auto overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden">
                <div className="flex flex-col items-center gap-4">
                  <Bot className="w-16 h-16 text-[#7C3AED] animate-pulse" />
                  <span className="text-gray-500 font-medium">Interactive Demo Player</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#0A0F1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Show, Don&apos;t Just Tell.</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our AI workflow is built to give your agency an unfair advantage by providing real, tangible value before the first meeting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="w-6 h-6 text-[#7C3AED]" />}
              title="AI Website Generation"
              description="Each prospect gets a live, deployed website demo in 60 seconds. They see their business in a new design before you even talk."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-[#F97316]" />}
              title="Multi-Channel Outreach"
              description="Reach prospects on Email + Instagram + Facebook simultaneously. 3x more touchpoints = 3x more replies."
            />
            <FeatureCard
              icon={<Target className="w-6 h-6 text-green-500" />}
              title="Auto Lead Discovery"
              description="Scrape Google Places, Reddit, and IndieHackers for high-intent leads. No manual URL entry required."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-pink-500" />}
              title="Built-in Lead Scoring"
              description="HOT/WARM/LOW scoring based on rating, reviews, and category. Focus on leads that actually convert."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-blue-500" />}
              title="User-Owned Vercel"
              description="Connect your Vercel account via OAuth. Sites are deployed to your subdomains, keeping hosting costs $0 for us."
            />
            <FeatureCard
              icon={<Bot className="w-6 h-6 text-purple-500" />}
              title="Automated Follow-ups"
              description="3-5 email sequence with smart pauses. Stop automatically when prospect replies positive. Human handoff ready."
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-medium text-gray-500 mb-12 uppercase tracking-widest">Powered By Industry Leaders</h3>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="text-2xl font-bold">Vercel</div>
            <div className="text-2xl font-bold">DeepSeek</div>
            <div className="text-2xl font-bold">Apify</div>
            <div className="text-2xl font-bold">Supabase</div>
            <div className="text-2xl font-bold">Polar</div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-1 group">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}
