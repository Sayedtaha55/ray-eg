import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text());
  });
  page.on('pageerror', (err) => errors.push('PAGE_ERROR: ' + err.message));

  await page.goto('http://localhost:3000/admin/gate', { waitUntil: 'networkidle' });

  // Check if button exists and is disabled
  const btn = page.locator('button', { hasText: 'دخول مطور حجوزات' });
  const count = await btn.count();
  console.log('Button count:', count);
  
  if (count > 0) {
    const isDisabled = await btn.first().isDisabled();
    console.log('Button disabled:', isDisabled);
    
    // Click the button
    await btn.first().click();
    await page.waitForTimeout(1000);
    
    // Check if dropdown appeared
    const dropdownHeader = page.locator('text=أنشطة الحجوزات');
    const dropdownVisible = await dropdownHeader.isVisible().catch(() => false);
    console.log('Dropdown visible after click:', dropdownVisible);
    
    // If dropdown is visible, try clicking an activity
    if (dropdownVisible) {
      const activityBtn = page.locator('button', { hasText: 'عيادات' });
      const activityCount = await activityBtn.count();
      console.log('Activity buttons found:', activityCount);
      
      if (activityCount > 0) {
        await activityBtn.first().click();
        await page.waitForTimeout(3000);
        console.log('Current URL after activity click:', page.url());
      }
    }
  }
  
  console.log('Console/Page errors:', errors.length ? errors : 'none');
  await browser.close();
})().catch((e) => console.log('ERR:', e.message));
