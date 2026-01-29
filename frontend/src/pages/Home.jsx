import { Link } from 'react-router-dom'
import {
  SparklesIcon,
  SunIcon,
  WrenchScrewdriverIcon,
  WrenchIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/solid'
import AnimatedSection, { AnimatedChildren } from '../components/animations/AnimatedSection'
import { AnimatedHeading, GradientText } from '../components/ui/AnimatedText'
import PremiumCard from '../components/ui/PremiumCard'
import MagneticButton from '../components/ui/MagneticButton'
import { ScrollIndicator } from '../components/ui/ScrollProgress'

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-luxury-black via-luxury-charcoal to-luxury-slate text-white py-20 md:py-32">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-luxury-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <AnimatedSection animation="fadeUp" delay={0.2}>
                <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">Welcome to Dr. Ahmed Dental Care</p>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={0.3}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 text-white font-serif font-bold">
                  Your Smile is Our <GradientText>Priority</GradientText>
                </h1>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={0.4}>
                <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
                  Expert dental care with a gentle touch. Book your appointment today and experience personalized dental care that transforms your smile.
                </p>
              </AnimatedSection>

              <AnimatedSection animation="fadeUp" delay={0.5}>
                <div className="flex flex-wrap gap-4">
                  <MagneticButton to="/book-appointment" variant="luxury" size="lg">
                    Book Appointment
                  </MagneticButton>
                  <MagneticButton to="/services" variant="glass" size="lg">
                    Our Services
                  </MagneticButton>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection animation="fadeLeft" delay={0.3} className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/20 to-primary/20 rounded-2xl transform rotate-3" />
                <img
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&auto=format&fit=crop&q=60"
                  alt="Dental Care"
                  className="relative rounded-2xl shadow-luxury w-full"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ScrollIndicator />
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 md:py-32 bg-luxury-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">What We Offer</p>
            <AnimatedHeading level={2} className="text-3xl md:text-4xl text-luxury-black mb-4">
              Our Services
            </AnimatedHeading>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive dental care for the whole family with state-of-the-art technology
            </p>
          </AnimatedSection>

          <AnimatedChildren
            animation="fadeUp"
            stagger={0.1}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: SparklesIcon, title: 'Teeth Cleaning', desc: 'Professional cleaning to maintain oral health and prevent dental issues.', color: 'text-blue-500 bg-blue-50' },
              { icon: SunIcon, title: 'Teeth Whitening', desc: 'Get a brighter, whiter smile with our professional whitening treatments.', color: 'text-yellow-500 bg-yellow-50' },
              { icon: WrenchScrewdriverIcon, title: 'Root Canal', desc: 'Painless root canal treatment to save your natural teeth.', color: 'text-red-500 bg-red-50' },
              { icon: WrenchIcon, title: 'Dental Implants', desc: 'Permanent solution for missing teeth with natural-looking implants.', color: 'text-purple-500 bg-purple-50' }
            ].map((service, index) => (
              <PremiumCard key={index} className="text-center bg-white" glow>
                <div className={`p-3 rounded-full ${service.color} inline-flex mb-4`}>
                  <service.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold text-luxury-black mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </PremiumCard>
            ))}
          </AnimatedChildren>

          <AnimatedSection animation="fadeUp" delay={0.4} className="text-center mt-12">
            <MagneticButton to="/services" variant="outline">
              View All Services
            </MagneticButton>
          </AnimatedSection>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-luxury-black to-luxury-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">Why Us</p>
            <AnimatedHeading level={2} className="text-3xl md:text-4xl text-white mb-4">
              Why Choose Us
            </AnimatedHeading>
            <p className="text-white/70 max-w-2xl mx-auto">
              Experience the difference of quality dental care with our dedicated team
            </p>
          </AnimatedSection>

          <AnimatedChildren
            animation="scale"
            stagger={0.15}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: UserIcon, title: 'Experienced Doctor', desc: 'Dr. Ahmed has over 15 years of experience in providing quality dental care.', color: 'text-luxury-gold' },
              { icon: BuildingOfficeIcon, title: 'Modern Equipment', desc: 'State-of-the-art technology for accurate diagnosis and comfortable treatment.', color: 'text-blue-400' },
              { icon: CurrencyDollarIcon, title: 'Affordable Prices', desc: 'Quality dental care at competitive prices with flexible payment options.', color: 'text-green-400' }
            ].map((feature, index) => (
              <PremiumCard key={index} className="text-center !bg-white/5 !border-white/10" tilt>
                <feature.icon className={`w-14 h-14 mx-auto mb-4 ${feature.color}`} />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.desc}</p>
              </PremiumCard>
            ))}
          </AnimatedChildren>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32 bg-luxury-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeUp" className="text-center mb-16">
            <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">Testimonials</p>
            <AnimatedHeading level={2} className="text-3xl md:text-4xl text-luxury-black mb-4">
              What Our Patients Say
            </AnimatedHeading>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real reviews from real patients who trust us with their smiles
            </p>
          </AnimatedSection>

          <AnimatedChildren
            animation="fadeUp"
            stagger={0.2}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[
              { quote: "Dr. Ahmed is amazing! He made me feel comfortable and the procedure was painless. Highly recommended!", author: 'Sarah Khan', role: 'Patient' },
              { quote: "Professional service, friendly staff, and great results. My family has been coming here for years!", author: 'Mohammad Ali', role: 'Patient' }
            ].map((testimonial, index) => (
              <PremiumCard key={index} className="bg-white" glow>
                <div className="flex items-start gap-4">
                  <div className="text-5xl text-luxury-gold/30 font-serif">"</div>
                  <div>
                    <p className="text-gray-600 italic text-lg mb-4">{testimonial.quote}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                        <span className="text-luxury-gold font-semibold">{testimonial.author[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-luxury-black">{testimonial.author}</p>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </AnimatedChildren>
        </div>
      </section>

      {/* Clinic Timings */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeUp" className="text-center mb-12">
            <AnimatedHeading level={2} className="text-3xl md:text-4xl text-white">
              Clinic Timings
            </AnimatedHeading>
          </AnimatedSection>

          <AnimatedSection animation="scale" className="max-w-md mx-auto">
            <PremiumCard className="!bg-white/10 !border-white/20 backdrop-blur-xl">
              {[
                { day: 'Monday - Friday', time: '9:00 AM - 6:00 PM' },
                { day: 'Saturday', time: '9:00 AM - 2:00 PM' },
                { day: 'Sunday', time: 'Closed' }
              ].map((timing, index) => (
                <div key={index} className={`flex justify-between py-4 ${index !== 2 ? 'border-b border-white/20' : ''}`}>
                  <span className="text-white/90">{timing.day}</span>
                  <span className="font-semibold text-white">{timing.time}</span>
                </div>
              ))}
            </PremiumCard>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 md:py-32 bg-luxury-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeUp" className="text-center mb-12">
            <p className="text-luxury-gold tracking-widest text-sm mb-4 uppercase">Get In Touch</p>
            <AnimatedHeading level={2} className="text-3xl md:text-4xl text-luxury-black">
              Contact Us
            </AnimatedHeading>
          </AnimatedSection>

          <AnimatedChildren
            animation="fadeUp"
            stagger={0.1}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: MapPinIcon, title: 'Address', lines: ['123 Main Street, Gulshan-e-Iqbal, Karachi'], color: 'text-primary bg-primary/10' },
              { icon: PhoneIcon, title: 'Phone', lines: ['+92 301 2345678', 'Emergency: +92 300 1234567'], color: 'text-green-500 bg-green-50' },
              { icon: EnvelopeIcon, title: 'Email', lines: ['info@ahmeddental.com'], color: 'text-red-500 bg-red-50' }
            ].map((contact, index) => (
              <PremiumCard key={index} className="text-center bg-white" glow>
                <div className={`p-3 rounded-full ${contact.color} inline-flex mb-4`}>
                  <contact.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-luxury-black mb-2">{contact.title}</h3>
                {contact.lines.map((line, i) => (
                  <p key={i} className="text-gray-600">{line}</p>
                ))}
              </PremiumCard>
            ))}
          </AnimatedChildren>

          <AnimatedSection animation="fadeUp" delay={0.4} className="text-center mt-12">
            <MagneticButton to="/contact" variant="primary" size="lg">
              Send Us a Message
            </MagneticButton>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
