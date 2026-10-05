import { test, expect } from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.goto('/tests/fixtures/site.html');
  await page.evaluate(() => document.fonts.ready);
});

for (const width of [360, 520, 760, 1000, 1440]) {
  test(`all headings use their central settings at ${width}px`, async ({page}) => {
    await page.setViewportSize({width,height:1000});
    const result=await page.evaluate(() => {
      const contexts=['hero','inner-hero','news-detail','service-card','configurator-scene','legal-section','site-footer'];
      const values=[];
      for(let level=1;level<=6;level++) {
        const measurements=[];
        for(const context of contexts) {
          const parent=document.createElement('section');parent.className=context;
          const heading=document.createElement('h'+level);heading.textContent='Überschrift';parent.append(heading);document.body.append(parent);
          const style=getComputedStyle(heading);
          measurements.push([style.fontFamily,style.fontWeight,style.fontSize,style.lineHeight]);parent.remove();
        }
        values.push(measurements);
      }
      return values;
    });
    for(const values of result) {
      expect(new Set(values.map(v=>JSON.stringify(v))).size).toBe(1);
      expect(values[0][0]).toContain('SK Modernist');expect(values[0][1]).toBe('700');
    }
    const sizes=result.map(v=>parseFloat(v[0][2]));
    expect(sizes[5]).toBeGreaterThanOrEqual(17);
    for(let i=0;i<5;i++)expect(sizes[i]).toBeGreaterThan(sizes[i+1]);
    if(width===1440)for(let i=0;i<5;i++)expect(sizes[i]/sizes[i+1]).toBeCloseTo(1.33,2);
  });
}

test('changing the h1 variables changes every h1, without affecting h2', async ({page}) => {
  const before=await page.locator('#headings h2').evaluate(el=>getComputedStyle(el).fontSize);
  await page.evaluate(()=>{
    for(const [key,value]of Object.entries({'size':'3.125rem','weight':'400','family':'"IBM Plex Sans", Arial, sans-serif','line-height':'1.4'}))document.documentElement.style.setProperty('--font-h1-'+key,value);
  });
  for(const heading of await page.locator('h1').all()) {
    await expect(heading).toHaveCSS('font-size','50px');await expect(heading).toHaveCSS('font-weight','400');await expect(heading).toHaveCSS('line-height','70px');
  }
  await expect(page.locator('#headings h2')).toHaveCSS('font-size',before);
});

test('real fonts load from this repository and body text remains 17px', async ({page}) => {
  const fonts=await page.evaluate(()=>[...document.fonts].map(f=>({family:f.family,weight:f.weight,status:f.status})));
  expect(fonts).toContainEqual(expect.objectContaining({family:'SK Modernist',weight:'700',status:'loaded'}));
  expect(fonts).toContainEqual(expect.objectContaining({family:'IBM Plex Sans',status:'loaded'}));
  await expect(page.locator('body')).toHaveCSS('font-size','17px');
});
