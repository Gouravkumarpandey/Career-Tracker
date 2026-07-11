import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import ChatbotWidget from '../components/ChatbotWidget';
import { 
  FaCheck, 
  FaRegTimesCircle, 
  FaRegCheckCircle, 
  FaRegFileAlt, 
  FaRegClock, 
  FaLayerGroup, 
  FaRegThumbsUp, 
  FaCertificate, 
  FaArrowRight,
  FaRegLightbulb
} from 'react-icons/fa';

const Home = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-stagger').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <section className="hero" style={{ background: '#f8fafc', padding: '30px 0 100px', minHeight: 'auto' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '60px', textAlign: 'left', maxWidth: '1280px' }}>
          
          <div className="hero-content" style={{ flex: 1, maxWidth: '600px' }}>
            <span style={{ color: 'var(--primary-color)', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '24px', display: 'block' }}>
              Your all-in-one career tracker
            </span>
            <h1 style={{ fontSize: '56px', fontWeight: '800', color: 'var(--secondary-color)', lineHeight: '1.1', marginBottom: '24px' }}>
              Navigate your <span style={{ color: 'var(--primary-color)' }}>career path</span><br/>
              with confidence.
            </h1>
            
            <p style={{ fontSize: '18px', color: '#64748b', lineHeight: '1.6', marginBottom: '32px' }}>
              We're more than just a job board. Get personalized job recommendations based on your unique skills, access top-tier interview preparation resources, and seamlessly track all your applications in one place.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
              <div className="check-item" style={{ justifyContent: 'flex-start' }}>
                <span className="check-icon"><FaCheck size={12} /></span>
                Skill-Based Job Recommendations
              </div>
              <div className="check-item" style={{ justifyContent: 'flex-start' }}>
                <span className="check-icon"><FaCheck size={12} /></span>
                Centralized Application Tracking
              </div>
              <div className="check-item" style={{ justifyContent: 'flex-start' }}>
                <span className="check-icon"><FaCheck size={12} /></span>
                Interview Preparation Platform
              </div>
              <div className="check-item" style={{ justifyContent: 'flex-start' }}>
                <span className="check-icon"><FaCheck size={12} /></span>
                And Much More...
              </div>
            </div>

            <div className="hero-cta" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'flex-start' }}>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '16px 32px', borderRadius: '8px' }}>SIGN UP FOR FREE</Link>
            </div>
          </div>

          <div className="hero-image" style={{ flex: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
            <img 
              src="https://imagedelivery.net/Y5A9xjWICSgIFJs9qxiQrg/5f2a3b01-d209-46d4-0979-e39180f2f500/w=1400" 
              alt="AI Resume Builder UI" 
              style={{ width: '100%', maxWidth: '800px', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', objectFit: 'cover' }} 
            />
          </div>

        </div>
      </section>

      <section className="job-tracker-standalone">
        <div className="tracker-inner">
          <div className="tracker-content">
            <span className="tracker-eyebrow">Job Application Tracker</span>
            <h2 className="tracker-heading">Keep track of all<br/>your job<br/>applications</h2>
            <p className="tracker-desc">
              No more messy spreadsheets. Track and manage all your job applications in one place.
              Instantly save job descriptions, contacts, salaries, documents, and more.
            </p>
          </div>
          <div className="tracker-screenshot">
            <img 
              src="https://imagedelivery.net/Y5A9xjWICSgIFJs9qxiQrg/a203c54b-c0dc-41fe-c803-312c4f1d0100/w=1796,format=auto" 
              alt="Job Tracker App" 
            />
          </div>
        </div>
      </section>

      {/* Trusted Companies Section */}
      <section className="trusted-companies">
        <div className="container">
          <h2 className="reveal">Trusted by job seekers who've landed at top companies</h2>
          <p className="subtitle reveal">Our users have secured positions at industry-leading companies such as</p>
          <div className="logos-container">
            <div className="logos-grid">
              {/* Original Logos */}
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bloomberg_logo.svg/512px-Bloomberg_logo.svg.png" alt="Bloomberg" className="company-logo" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" alt="Microsoft" className="company-logo" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Adobe_Systems_logo_and_wordmark.svg/512px-Adobe_Systems_logo_and_wordmark.svg.png" alt="Adobe" className="company-logo" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="company-logo" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" alt="Meta" className="company-logo" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="company-logo" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="company-logo" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="company-logo" />
              
              {/* Duplicated for seamless marquee effect */}
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bloomberg_logo.svg/512px-Bloomberg_logo.svg.png" alt="Bloomberg" className="company-logo" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" alt="Microsoft" className="company-logo" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Adobe_Systems_logo_and_wordmark.svg/512px-Adobe_Systems_logo_and_wordmark.svg.png" alt="Adobe" className="company-logo" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="company-logo" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" alt="Meta" className="company-logo" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="company-logo" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="company-logo" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="company-logo" />
            </div>
          </div>
        </div>
      </section>

      {/* Frustration Section */}
      <section className="frustration-section">
        <div className="container">
          <h2 className="reveal">
            Say goodbye to job <span className="highlight">search<br/>frustration</span>
          </h2>
          <p className="subtitle reveal" style={{ marginBottom: '60px' }}>
            From constant rejections to landing your dream job, discover<br/>the difference Careerflow can make
          </p>

          <div className="comparison-container reveal-stagger reveal">
            {/* Before Column */}
            <div className="comparison-col">
              <div className="comparison-header before-header">
                <FaRegTimesCircle size={20} /> BEFORE CAREERFLOW
              </div>
              <p className="comparison-desc">Struggling to navigate the job<br/>market without the right tools</p>
              
              <div className="comparison-card">
                <div className="card-icon red-icon"><FaRegFileAlt size={24} /></div>
                <div className="card-content">
                  <h3>Rejection</h3>
                  <p>Non-compliant resumes lead to rejections</p>
                </div>
              </div>

              <div className="comparison-card border-red">
                <div className="card-icon red-icon"><FaRegClock size={24} /></div>
                <div className="card-content">
                  <h3>Time Wasted</h3>
                  <p>Job searching is a time-consuming task</p>
                </div>
              </div>

              <div className="comparison-card">
                <div className="card-icon red-icon"><FaLayerGroup size={24} /></div>
                <div className="card-content">
                  <h3>Fragmented Tools</h3>
                  <p>Switching between multiple tools is stressful</p>
                </div>
              </div>
            </div>

            {/* Middle Arrow */}
            <div className="comparison-arrow">
              <FaArrowRight size={24} color="#94a3b8" />
            </div>

            {/* After Column */}
            <div className="comparison-col">
              <div className="comparison-header after-header">
                <FaRegCheckCircle size={20} /> AFTER CAREERFLOW
              </div>
              <p className="comparison-desc">Easily navigate the job market<br/>with AI-powered tools</p>
              
              <div className="comparison-card">
                <div className="card-icon green-icon"><FaRegThumbsUp size={24} /></div>
                <div className="card-content">
                  <h3>No More Rejections</h3>
                  <p>Instantly create ATS-friendly resumes</p>
                </div>
              </div>

              <div className="comparison-card border-green">
                <div className="card-icon green-icon"><FaRegClock size={24} /></div>
                <div className="card-content">
                  <h3>Save Time</h3>
                  <p>Careerflow's AI tools simplify your job search</p>
                </div>
              </div>

              <div className="comparison-card">
                <div className="card-icon green-icon"><FaCertificate size={24} /></div>
                <div className="card-content">
                  <h3>All in One Solution</h3>
                  <p>Manage your entire job search in one platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplify Section */}
      <section className="simplify-section">
        <div className="container">
          <h2 className="section-title text-center reveal">
            <span className="highlight">Simplify Every Step</span> of Your<br/>Job Search with Careerflow
          </h2>

          <div className="feature-row reveal">
            <div className="feature-content reveal-left">
              <div className="feature-eyebrow">
                <FaRegFileAlt /> AI RESUME BUILDER
              </div>
              <h3>
                Instantly build a job-ready<br/>
                <span className="highlight">resume with AI</span>
              </h3>
              <p>
                Use AI to make your resume ATS-friendly, boost your score, and add job-specific keywords in just a few clicks.
              </p>
              <Link to="/signup" className="btn btn-outline" style={{ borderRadius: '8px' }}>CREATE MY RESUME</Link>
            </div>
            <div className="feature-image reveal-right">
              <img src="https://cdn.prod.website-files.com/635c591378332f38be25d45f/672a117701b7c53c355ad99e_Frame%2067-p-1080.webp" alt="AI Resume Builder" />
            </div>
          </div>

          <div className="feature-row reverse reveal">
            <div className="feature-content reveal-right">
              <div className="feature-eyebrow pink">
                <FaRegLightbulb /> JOB FIT ANALYZER
              </div>
              <h3>
                <span className="highlight-pink">Personalize your<br/>documents</span> for every Job
              </h3>
              <p>
                Quickly create resumes and cover letters tailored to each job's specific requirements.
              </p>
              <Link to="/signup" className="btn btn-outline-pink" style={{ borderRadius: '8px' }}>ANALYZE JOB FIT</Link>
            </div>
            <div className="feature-image reveal-left">
              <img src="https://cdn.prod.website-files.com/635c591378332f38be25d45f/672a11abf4f3948f579d9b6a_Frame%2069-p-1080.webp" alt="Job Fit Analyzer" />
            </div>
          </div>

          {/* AI Resume Tailor Row */}
          <div className="feature-row reveal">
            <div className="feature-content reveal-left">
              <div className="feature-eyebrow">
                <FaRegLightbulb /> AI RESUME TAILOR
              </div>
              <h3>
                Tailor Your Resume to Any<br/>
                <span className="highlight">Job Description with AI</span>
              </h3>
              <p>
                Paste any job description. Our AI Resume Tailor rewrites your bullet points, maps your skills to the right keywords, and scores your match in real time. <strong>Tailored resumes get 2× more interviews.</strong>
              </p>
              <Link to="/signup" className="btn btn-outline" style={{ borderRadius: '8px' }}>TAILOR MY RESUME</Link>
            </div>
            <div className="feature-image reveal-right">
              <img 
                src="https://imagedelivery.net/Y5A9xjWICSgIFJs9qxiQrg/ecadc7c9-857d-44e4-00d2-cd6fcfb6f200/w=2200,format=auto" 
                alt="AI Resume Tailor" 
                style={{ borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* Community Section */}
      <section className="community-section" style={{ backgroundColor: '#f0f7ff', padding: '80px 0', overflow: 'hidden' }}>
        <div className="container text-center">
          <h2 className="section-title reveal" style={{ marginBottom: '16px' }}>Hear From Our <span className="highlight">Community</span></h2>
          <p className="subtitle reveal" style={{ marginBottom: '40px' }}>Trusted and loved by over 1M+ users worldwide.</p>
          <div className="testimonials-grid reveal-stagger reveal">
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>“Careerflow gave me confidence in my CV and Cover Letter with its skill match checker and generator, enabling multiple submissions to numerous companies”</p>
              <div className="author">
                <img src="https://i.pravatar.cc/100?img=11" alt="David Gartner" />
                <div className="author-info">
                  <strong>David Gartner</strong>
                  <span>Financial Analyst</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>“The Careerflow extension kept me organized, saved time applying, improved my resume and aligned my applications to land interview opportunities.”</p>
              <div className="author">
                <img src="https://i.pravatar.cc/100?img=12" alt="Ntow Emmanuel Akyea" />
                <div className="author-info">
                  <strong>Ntow Emmanuel Akyea</strong>
                  <span>Copywriter</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>“An essential tool for anyone actively job hunting. It streamlines the whole process and keeps everything in one place.”</p>
              <div className="author">
                <img src="https://i.pravatar.cc/100?img=13" alt="Sarah Jenkins" />
                <div className="author-info">
                  <strong>Sarah Jenkins</strong>
                  <span>Software Engineer</span>
                </div>
              </div>
            </div>
          </div>
          <div className="carousel-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container text-center">
          <h2 className="section-title" style={{ marginBottom: '16px', color: 'var(--secondary-color)' }}>
            Simple Pricing,<br/>
            Powerful Features
          </h2>
          <p className="subtitle" style={{ marginBottom: '40px' }}>Whether you're starting out or need extra support, we have a plan for you</p>
          
          <div className="pricing-toggle">
             <span className="toggle-btn">Weekly</span>
             <span className="toggle-btn">Monthly</span>
             <span className="toggle-btn">Quarterly</span>
             <span className="toggle-btn active">Yearly (20% saved)</span>
          </div>

          <div className="pricing-cards">
            {/* Standard Card */}
            <div className="pricing-card basic reveal">
              <div className="plan-name">Standard</div>
              <p className="plan-desc">For individuals and<br/>early job seekers</p>
              <div className="features-title">Features</div>
              <ul className="plan-features">
                <li><FaCheck size={10}/> Skill-based job recommendations</li>
                <li><FaCheck size={10}/> Application tracker (up to 20)</li>
                <li className="disabled"><FaCheck size={10}/> Interview prep resources</li>
                <li className="disabled"><FaCheck size={10}/> Priority AI suggestions</li>
              </ul>
              <div className="price-box">
                <div className="price">₹499<span className="period">/Month</span></div>
                <button className="btn btn-outline-green">Get Started</button>
              </div>
            </div>
            
            {/* Startup Card */}
            <div className="pricing-card popular reveal">
              <div className="plan-name">Pro</div>
              <p className="plan-desc">For serious job seekers who<br/>want maximum results</p>
              <div className="features-title">Features</div>
              <ul className="plan-features">
                <li><FaCheck size={10}/> Skill-based job recommendations</li>
                <li><FaCheck size={10}/> Unlimited application tracking</li>
                <li><FaCheck size={10}/> Interview prep resources</li>
                <li><FaCheck size={10}/> Priority AI suggestions</li>
              </ul>
              <div className="price-box">
                <div className="price">₹999<span className="period">/Month</span></div>
                <button className="btn btn-white-green">Get Started</button>
              </div>
            </div>

            {/* Enterprise Card */}
            <div className="pricing-card basic reveal">
              <div className="plan-name">Enterprise</div>
              <p className="plan-desc">For teams, colleges &<br/>placement consultants</p>
              <div className="features-title">Features</div>
              <ul className="plan-features">
                <li><FaCheck size={10}/> Everything in Pro</li>
                <li><FaCheck size={10}/> Team dashboards & analytics</li>
                <li><FaCheck size={10}/> Dedicated account manager</li>
                <li><FaCheck size={10}/> Custom integrations</li>
              </ul>
              <div className="price-box">
                <div className="price">₹2,499<span className="period">/Month</span></div>
                <button className="btn btn-outline-green">Get Started</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" style={{ backgroundColor: '#e5f0ff' }}>
        <div className="container">
          <h2 className="section-title text-center" style={{ marginBottom: '16px' }}>Have More <span className="highlight">Questions?</span></h2>
          <p className="subtitle text-center" style={{ marginBottom: '40px' }}>Here are some of the frequently asked questions from our customers</p>
          
          <div className="faq-list">
            <details className="faq-item">
              <summary>What is Careerflow, and how can it help my career?</summary>
              <div className="faq-answer">Careerflow is an AI-powered platform designed to optimize your job search...</div>
            </details>
            <details className="faq-item">
              <summary>How does Careerflow's AI Resume Analyzer work?</summary>
              <div className="faq-answer">Our AI Resume Analyzer scans your resume against job descriptions...</div>
            </details>
            <details className="faq-item">
              <summary>Can Careerflow help me optimize my LinkedIn profile?</summary>
              <div className="faq-answer">Yes, our extension provides actionable tips...</div>
            </details>
            <details className="faq-item">
              <summary>What is Careerflow's Job Tracker, and how does it work?</summary>
              <div className="faq-answer">The Job Tracker is a centralized dashboard...</div>
            </details>
            <details className="faq-item">
              <summary>Does Careerflow provide interview and career coaching?</summary>
              <div className="faq-answer">We offer various resources and AI tools to prep...</div>
            </details>
            <details className="faq-item">
              <summary>Is Careerflow free, or do I need to pay for premium features?</summary>
              <div className="faq-answer">We offer a robust free tier, as well as premium plans...</div>
            </details>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="resources-section">
        <div className="container">
          <h2 className="section-title text-center" style={{ marginBottom: '16px' }}>Insightful <span className="highlight">Resources</span></h2>
          <p className="subtitle text-center" style={{ marginBottom: '40px' }}>Here are some of the frequently asked questions from our customers</p>
          
          <div className="resources-grid">
            <div className="resource-card">
              <div className="resource-image bg-blue-grad-1"></div>
              <div className="resource-content">
                <h3>Communication Skills for Your Resume: 12 Examples and How to Show Them</h3>
                <p>A resume-focused guide covering the three types of communication skills, 12 specific skills worth listing by role...</p>
              </div>
            </div>
            <div className="resource-card">
              <div className="resource-image bg-blue-grad-2"></div>
              <div className="resource-content">
                <h3>Ghost Jobs Are Everywhere: Here's What That Means for Your Job Search</h3>
                <p>An educational guide explaining what ghost jobs are, why they're now 20-40% of job board listings...</p>
              </div>
            </div>
            <div className="resource-card">
              <div className="resource-image bg-blue-grad-3"></div>
              <div className="resource-content">
                <h3>Careerflow vs Jobright (2026): Which Should You Use?</h3>
                <p>A feature-by-feature comparison of Careerflow and Jobright across resume building, job matching, LinkedIn optimization...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="container text-center">
          <h2 style={{ fontSize: '48px', color: 'var(--secondary-color)', marginBottom: '24px' }}>Take Control of Your<br/>Job Search Today</h2>
          <p style={{ color: 'var(--secondary-color)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>Join thousands who've transformed their job search with Careerflow. Access powerful AI tools designed to help you land interviews faster at no cost.</p>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>SIGN UP FOR FREE</Link>
        </div>
      </section>


      <ChatbotWidget />
      <Footer />
    </div>
  );
};

export default Home;
