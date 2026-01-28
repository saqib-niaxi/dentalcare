import {
  RocketLaunchIcon,
  EyeIcon,
  HeartIcon,
  BeakerIcon,
  UserGroupIcon,
  BookOpenIcon
} from '@heroicons/react/24/solid'
import AnimatedSection, { AnimatedChildren } from '../components/animations/AnimatedSection'
import { AnimatedHeading, GradientText } from '../components/ui/AnimatedText'
import PremiumCard from '../components/ui/PremiumCard'

export default function About() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-luxury-black via-luxury-charcoal to-luxury-slate text-white py-24 md:py-32">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-luxury-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fadeUp">
            <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">Our Story</p>
          </AnimatedSection>
          <AnimatedHeading level={1} className="text-4xl md:text-5xl lg:text-6xl text-white mb-6">
            About <GradientText>Us</GradientText>
          </AnimatedHeading>
          <AnimatedSection animation="fadeUp" delay={0.3}>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Learn more about Dr. Ahmed Dental Care and our commitment to your oral health.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Doctor Profile */}
      <section className="py-20 md:py-32 bg-luxury-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="fadeRight">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/20 to-primary/20 rounded-2xl transform -rotate-3" />
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=60"
                  alt="Dr. Ahmed"
                  className="relative rounded-2xl shadow-luxury w-full"
                />
              </div>
            </AnimatedSection>

            <div>
              <AnimatedSection animation="fadeUp">
                <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">Meet Our Expert</p>
              </AnimatedSection>
              <AnimatedHeading level={2} className="text-3xl md:text-4xl text-luxury-black mb-6">
                Dr. Ahmed
              </AnimatedHeading>
              <AnimatedSection animation="fadeUp" delay={0.2}>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Dr. Ahmed is a highly qualified dental surgeon with over 15 years of experience in the field. He graduated from Dow University of Health Sciences and has been serving the community with dedication and excellence.
                </p>
              </AnimatedSection>
              <AnimatedSection animation="fadeUp" delay={0.3}>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  With advanced training in cosmetic dentistry, oral surgery, and endodontics, Dr. Ahmed provides comprehensive dental care using the latest techniques and technologies.
                </p>
              </AnimatedSection>

              <AnimatedChildren
                animation="scale"
                stagger={0.1}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { number: '15+', label: 'Years Experience' },
                  { number: '10,000+', label: 'Happy Patients' },
                  { number: '20+', label: 'Services' },
                  { number: '100%', label: 'Satisfaction' }
                ].map((stat, index) => (
                  <PremiumCard key={index} className="text-center bg-white !p-4" tilt={false}>
                    <div className="text-2xl font-bold text-luxury-gold">{stat.number}</div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </PremiumCard>
                ))}
              </AnimatedChildren>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-luxury-black to-luxury-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">What Drives Us</p>
            <AnimatedHeading level={2} className="text-3xl md:text-4xl text-white">
              Mission & Vision
            </AnimatedHeading>
          </AnimatedSection>

          <AnimatedChildren
            animation="fadeUp"
            stagger={0.2}
            className="grid md:grid-cols-2 gap-8"
          >
            <PremiumCard className="!bg-white/5 !border-white/10" glow glowColor="rgba(212, 175, 55, 0.2)">
              <RocketLaunchIcon className="w-12 h-12 text-luxury-gold mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-white/70 leading-relaxed">
                To provide exceptional dental care in a comfortable and caring environment, making quality dental services accessible to everyone in our community. We believe that a healthy smile is a gateway to overall well-being.
              </p>
            </PremiumCard>

            <PremiumCard className="!bg-white/5 !border-white/10" glow glowColor="rgba(42, 157, 143, 0.2)">
              <EyeIcon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-white/70 leading-relaxed">
                To be the most trusted dental care provider in Karachi, known for excellence in patient care, advanced treatments, and creating beautiful, healthy smiles that last a lifetime.
              </p>
            </PremiumCard>
          </AnimatedChildren>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-32 bg-luxury-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">What We Stand For</p>
            <AnimatedHeading level={2} className="text-3xl md:text-4xl text-luxury-black mb-4">
              Our Core Values
            </AnimatedHeading>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </AnimatedSection>

          <AnimatedChildren
            animation="fadeUp"
            stagger={0.1}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: HeartIcon, title: 'Patient Care', desc: 'Your comfort and well-being are our top priorities.', color: 'text-red-500 bg-red-50' },
              { icon: BeakerIcon, title: 'Excellence', desc: 'We strive for the highest standards in dental care.', color: 'text-blue-500 bg-blue-50' },
              { icon: UserGroupIcon, title: 'Integrity', desc: 'Honest, transparent communication with all patients.', color: 'text-green-500 bg-green-50' },
              { icon: BookOpenIcon, title: 'Education', desc: 'We empower patients with knowledge about oral health.', color: 'text-purple-500 bg-purple-50' }
            ].map((value, index) => (
              <PremiumCard key={index} className="text-center bg-white" glow>
                <div className={`p-3 rounded-full ${value.color} inline-flex mb-4`}>
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-luxury-black mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.desc}</p>
              </PremiumCard>
            ))}
          </AnimatedChildren>
        </div>
      </section>

      {/* Clinic Photos */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-luxury-black to-luxury-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">Take A Look</p>
            <AnimatedHeading level={2} className="text-3xl md:text-4xl text-white mb-4">
              Our Clinic
            </AnimatedHeading>
            <p className="text-white/70 max-w-2xl mx-auto">
              Modern facilities designed for your comfort
            </p>
          </AnimatedSection>

          <AnimatedChildren
            animation="scale"
            stagger={0.15}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { src: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&auto=format', alt: 'Reception' },
              { src: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&auto=format', alt: 'Treatment Room' },
              { src: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&auto=format', alt: 'Equipment' }
            ].map((photo, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <p className="text-lg font-semibold">{photo.alt}</p>
                </div>
              </div>
            ))}
          </AnimatedChildren>
        </div>
      </section>
    </div>
  )
}
