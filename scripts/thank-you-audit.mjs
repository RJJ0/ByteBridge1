import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import AxeBuilder from '@axe-core/playwright'
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
const reference=`pi_verified.${'a'.repeat(64)}`
const base=process.env.BASE_URL||'http://127.0.0.1:5173'
let status='succeeded', unavailable=false, creates=0
const errors=[]
try{
 const context=await browser.newContext({reducedMotion:'reduce'})
 await context.route('**/donation-status',route=>route.fulfill(unavailable?{status:404,json:{}}:{json:{reference,status,currency:'php',amount:status==='succeeded'?35050:null}}))
 await context.route('**/create-payment-intent',route=>{creates++;return route.fulfill({status:500,json:{}})})
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message))
 for(const width of [2560,1920,1440,1024,768,390,320]){
  await page.setViewportSize({width,height:width>=1440?900:1000})
  await page.goto(`${base}/donation/success?reference=${reference}&amount=1&redirect_status=failed`,{waitUntil:'networkidle'})
  await page.getByRole('heading',{name:'Thank you!',exact:true}).waitFor()
  assert.match(await page.locator('.thank-you__amount').innerText(),/350\.50/)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
  const layout=await page.evaluate(()=>{const a=document.querySelector('.thank-you__copy').getBoundingClientRect(),b=document.querySelector('.thank-you__art').getBoundingClientRect();return innerWidth>=768?a.right<=b.left:a.bottom<=b.top})
  assert.equal(layout,true)
  assert.equal(await page.getByRole('link',{name:'Back to Home',exact:true}).getAttribute('href'),'/')
  if(width===1440||width===390){await page.screenshot({path:`artifacts/qa/thank-you-${width}.png`,fullPage:true});assert.deepEqual((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id),[])}
 }
 await page.reload({waitUntil:'networkidle'});await page.getByRole('heading',{name:'Thank you!',exact:true}).waitFor();assert.equal(creates,0)
 for(status of ['processing','requires_payment_method','canceled','requires_action','requires_capture']){
  await page.goto(`${base}/donation/success?reference=${reference}&redirect_status=succeeded`,{waitUntil:'networkidle'})
  await page.getByRole('heading',{name:'Payment status',exact:true}).waitFor()
  assert.equal(await page.locator('.thank-you__amount').count(),0)
  assert.equal(await page.getByRole('heading',{name:'Thank you!',exact:true}).count(),0)
  if(status==='processing'){await page.getByText('Your payment is still processing.',{exact:false}).waitFor();status='succeeded';await page.getByRole('button',{name:'Check status again'}).click();await page.getByRole('heading',{name:'Thank you!',exact:true}).waitFor()}
 }
 unavailable=true
 await page.goto(`${base}/donation/success?reference=invalid&redirect_status=succeeded`,{waitUntil:'networkidle'})
 await page.getByText('We could not verify a payment.',{exact:false}).waitFor()
 await page.goto(`${base}/donation/success?redirect_status=succeeded&amount=35050`,{waitUntil:'networkidle'})
 await page.getByText('We could not verify a payment.',{exact:false}).waitFor();assert.equal(new URL(page.url()).search,'')
 unavailable=false;status='succeeded'
 await page.goto(`${base}/payment-success?payment_intent_client_secret=pi_verified_secret_fixture&redirect_status=succeeded`,{waitUntil:'networkidle'})
 await page.getByRole('heading',{name:'Thank you!',exact:true}).waitFor()
 assert.equal(new URL(page.url()).pathname,'/donation/success');assert.equal(page.url().includes('secret'),false)
 assert.equal(creates,0);assert.deepEqual(errors,[])
 console.log('Simulated success-page checks passed: 7 widths, PHP amount, refresh, redirect return, processing/retry, incomplete/canceled payments, missing/invalid reference, no new intents, and desktop/mobile accessibility.')
}finally{await browser.close()}
