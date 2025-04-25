import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About GenieOS – Our Mission & Team',
  description: 'Learn about the mission behind GenieOS and the team dedicated to revolutionizing real estate investment with AI.',
  openGraph: {
    title: 'About GenieOS',
    description: 'Meet the team building the AI operating system for real estate investors.',
    url: 'https://your-domain.com/about', // Replace with your actual URL
    // images: [{ url: '/api/og?page=about', width: 1200, height: 630 }], // Temporarily commented out
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">About GenieOS</h1>
        <p className="mt-4 text-lg text-muted-foreground">Empowering real estate investors with AI-driven clarity and speed.</p>
      </div>

      <section className="mb-16 max-w-3xl mx-auto">
        <h2 className="text-3xl font-semibold mb-4 text-center">Our Mission</h2>
        <p className="text-center text-lg text-muted-foreground">We're on a mission to empower real estate investors of every size with AI-driven clarity and speed. Gone are the days of guesswork and endless spreadsheets—GenieOS is your strategic partner, turning data into decisions in seconds.</p>
      </section>

      <section className="mb-16 bg-muted/30 py-12 rounded-lg">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-4 text-center">Our Story</h2>
          <p className="text-lg text-muted-foreground text-center">Founded by veteran investor & entrepreneur <strong>Keldrick Dickey</strong>, GenieOS began as a simple MAO calculator and has evolved into a full-blown AI Operating System. We built it because we were tired of slow deal cycles and missed opportunities—now we want to level the playing field for every investor.</p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-8 text-center">Meet the Team</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Founder Card */}
          <TeamMemberCard
            imgSrc="/team/keldrick.jpg"
            name="Keldrick Dickey"
            title="Founder & CEO"
            // bio="Optional short bio here..."
          />
          {/* CTO Card */}
          <TeamMemberCard
            imgSrc="/team/placeholder.jpg" // Replace with actual path
            name="[CTO Name]"
            title="CTO & Lead Engineer"
            // bio="Optional short bio here..."
          />
          {/* Head of Growth */}
          <TeamMemberCard
            imgSrc="/team/placeholder.jpg" // Replace with actual path
            name="[Head of Growth]"
            title="Head of Growth"
            // bio="Optional short bio here..."
          />
        </div>
      </section>

      <section className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-semibold mb-4">Join Us</h2>
        <p className="text-lg text-muted-foreground mb-6">Whether you're a solo investor or part of a big team, we'd love to hear your story. <Link href="/contact" className="text-primary underline hover:no-underline">Get in touch</Link> to share feedback, request features, or explore partnerships.</p>
        {/* Add social links or careers link if desired */}
      </section>
    </div>
  )
}

// Helper component for team member cards
interface TeamMemberCardProps {
  imgSrc: string;
  name: string;
  title: string;
  bio?: string;
}

function TeamMemberCard({ imgSrc, name, title, bio }: TeamMemberCardProps) {
  return (
    <div className="text-center bg-card p-6 rounded-lg border shadow-sm">
      <Image 
        src={imgSrc} 
        alt={name} 
        width={128} 
        height={128} 
        className="mx-auto rounded-full w-32 h-32 mb-4 object-cover border-2 border-muted"
      />
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="text-primary text-sm mb-2">{title}</p>
      {bio && <p className="text-muted-foreground text-xs">{bio}</p>}
    </div>
  );
} 