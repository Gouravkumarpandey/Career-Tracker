async function run() {
  const email = `testuser_${Date.now()}@gmail.com`;
  console.log(`Simulating signup flow for email: ${email}`);

  try {
    // 1. Request OTP
    console.log('Sending signup OTP request...');
    const otpRes = await fetch('http://localhost:3000/api/auth/signup-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const otpData = await otpRes.json();
    console.log('OTP response status:', otpRes.status);
    console.log('OTP response:', otpData);

    console.log('\nWait... Since OTP was sent to email, we need to inspect console/logs or memory to get it.');
    console.log('However, to test the validation, let\'s try verifying with a dummy/wrong OTP first:');
    
    const signupRes = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password: 'password123',
        otp: '000000'
      })
    });
    const signupData = await signupRes.json();
    console.log('Signup verification response status:', signupRes.status);
    console.log('Signup verification response:', signupData);
  } catch (err) {
    console.error('Integration test failed:', err.message);
  }
}

run();
