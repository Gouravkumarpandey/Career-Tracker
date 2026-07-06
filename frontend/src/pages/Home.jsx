import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
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
  return (
    <div>
      <section className="hero">
        <div className="container">
          <span className="hero-subtitle">Trusted by over 1.2 million job seekers!</span>
          <h1>
            Land your <span className="highlight">dream job.</span><br/>
            Without the stress.
          </h1>
          
          <div className="hero-checklist">
            <div className="check-item">
              <span className="check-icon"><FaCheck size={12} /></span>
              AI Resume Builder
            </div>
            <div className="check-item">
              <span className="check-icon"><FaCheck size={12} /></span>
              Automated Job Tracking
            </div>
            <div className="check-item">
              <span className="check-icon"><FaCheck size={12} /></span>
              Optimize your LinkedIn Profile
            </div>
            <div className="check-item">
              <span className="check-icon"><FaCheck size={12} /></span>
              And Much More...
            </div>
          </div>

          <div className="hero-cta">
            <Link to="/signup" className="btn btn-primary">SIGN UP FOR FREE</Link>
          </div>

          <div className="testimonial-section">
            <div className="avatars">
              <img className="avatar" src="https://i.pravatar.cc/100?img=11" alt="User 1" />
              <img className="avatar" src="https://i.pravatar.cc/100?img=12" alt="User 2" />
              <img className="avatar" src="https://i.pravatar.cc/100?img=13" alt="User 3" />
              <img className="avatar" src="https://i.pravatar.cc/100?img=14" alt="User 4" />
              <img className="avatar" src="https://i.pravatar.cc/100?img=15" alt="User 5" style={{ position: 'relative' }} />
            </div>
            <p className="testimonial-text">
              "I got recruiters from Amazon, Wise, and other companies reaching out to me already!!"
            </p>
          </div>
        </div>
      </section>

      <section className="job-tracker-standalone" style={{ padding: '0 0 80px', backgroundColor: 'var(--bg-color)' }}>
        <div className="container">
          <div className="feature-row">
            <div className="feature-content">
              <div className="feature-eyebrow">
                JOB TRACKER
              </div>
              <h3>
                <span className="highlight">Track, Organize, and<br/>Optimize</span> Your Job Search
              </h3>
              <p>
                Forget spreadsheets and endless bookmarks. Save, apply, track, and revisit job applications - all from 1 streamlined dashboard.
              </p>
              
              <div className="feature-checklist">
                <div className="check-item"><FaRegCheckCircle color="var(--primary-color)"/> Centralized Job Tracking</div>
                <div className="check-item"><FaRegCheckCircle color="var(--primary-color)"/> Job Insights</div>
                <div className="check-item"><FaRegCheckCircle color="var(--primary-color)"/> Track Key Contacts</div>
              </div>

              <Link to="/signup" className="btn btn-primary" style={{ borderRadius: '8px', padding: '12px 24px' }}>START TRACKING</Link>
            </div>
            <div className="feature-image tracker-image-container">
              <img src="https://cdn.prod.website-files.com/635c591378332f38be25d45f/678f676c8dfda6c3df305d3f_job%20tracke-new-hero-p-800.webp" alt="Job Tracker" />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Companies Section */}
      <section className="trusted-companies">
        <div className="container">
          <h2>Trusted by job seekers who've landed at top companies</h2>
          <p className="subtitle">Our users have secured positions at industry-leading companies such as</p>
          <div className="logos-grid">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Bloomberg_logo.svg" alt="Bloomberg" className="company-logo" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" alt="Microsoft" className="company-logo" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/bb/Adobe_Systems_logo_and_wordmark.svg" alt="Adobe" className="company-logo" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="company-logo" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" alt="Meta" className="company-logo" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="company-logo" />
          </div>
        </div>
      </section>

      {/* Frustration Section */}
      <section className="frustration-section">
        <div className="container">
          <h2>
            Say goodbye to job <span className="highlight">search<br/>frustration</span>
          </h2>
          <p className="subtitle" style={{ marginBottom: '60px' }}>
            From constant rejections to landing your dream job, discover<br/>the difference Careerflow can make
          </p>

          <div className="comparison-container">
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
          <h2 className="section-title text-center">
            <span className="highlight">Simplify Every Step</span> of Your<br/>Job Search with Careerflow
          </h2>

          <div className="feature-row">
            <div className="feature-content">
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
            <div className="feature-image">
              <img src="https://cdn.prod.website-files.com/635c591378332f38be25d45f/672a117701b7c53c355ad99e_Frame%2067-p-1080.webp" alt="AI Resume Builder" />
            </div>
          </div>

          <div className="feature-row reverse">
            <div className="feature-content">
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
            <div className="feature-image">
              <img src="https://cdn.prod.website-files.com/635c591378332f38be25d45f/672a11abf4f3948f579d9b6a_Frame%2069-p-1080.webp" alt="Job Fit Analyzer" />
            </div>
          </div>

        </div>
      </section>

      {/* Community Section */}
      <section className="community-section" style={{ backgroundColor: '#f0f7ff', padding: '80px 0', overflow: 'hidden' }}>
        <div className="container text-center">
          <h2 className="section-title" style={{ marginBottom: '16px' }}>Hear From Our <span className="highlight">Community</span></h2>
          <p className="subtitle" style={{ marginBottom: '40px' }}>Trusted and loved by over 1M+ users worldwide.</p>
          <div className="testimonials-grid">
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
            <div className="pricing-card basic">
              <div className="plan-name">Basic</div>
              <div className="price">Free</div>
              <button className="btn btn-outline" style={{width: '100%', marginTop: 'auto'}}>START NOW</button>
            </div>
            
            <div className="pricing-card popular">
              <div className="popular-badge">MOST POPULAR</div>
              <div className="plan-name">Premium</div>
              <div className="price"><span className="strike">₹1499</span> ₹400<span className="period">/month</span></div>
              <div className="total-price">₹4800 total</div>
              <button className="btn btn-primary" style={{width: '100%', marginTop: 'auto', backgroundColor: 'white', color: 'var(--primary-color)'}}>START NOW</button>
            </div>

            <div className="pricing-card best-value">
              <div className="best-value-badge">BEST VALUE</div>
              <div className="plan-name">Premium Plus</div>
              <div className="price"><span className="strike">₹1499</span> ₹833<span className="period">/month</span></div>
              <div className="total-price">₹9999 total</div>
              <p className="save-text">Save 35% on yearly plans</p>
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
          <h2 style={{ fontSize: '48px', color: 'white', marginBottom: '24px' }}>Take Control of Your<br/>Job Search Today</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>Join thousands who've transformed their job search with Careerflow. Access powerful AI tools designed to help you land interviews faster at no cost.</p>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>SIGN UP FOR FREE</Link>
        </div>
      </section>


      <button className="scroll-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        ↑
      </button>
      <Footer />
    </div>
  );
};

export default Home;
