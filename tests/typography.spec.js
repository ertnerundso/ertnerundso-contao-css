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
        // Prüfe die Anwendung der editierbaren Einstellungen statt eines festen Schnitts.
        const reference=document.createElement('span');
        for(const property of ['font-family','font-weight','font-size','line-height']) {
          const setting=property==='line-height'?'line-height':property.slice(5);
          reference.style.setProperty(property,`var(--font-h${level}-${setting})`);
        }
        reference.textContent='Referenz';document.body.append(reference);
        const style=getComputedStyle(reference);
        const expected=[style.fontFamily,style.fontWeight,style.fontSize,style.lineHeight];
        reference.remove();values.push({measurements,expected});
      }
      return values;
    });
    for(const {measurements,expected} of result) {
      for(const actual of measurements)expect(actual).toEqual(expected);
    }
    const sizes=result.map(v=>parseFloat(v.measurements[0][2]));
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
  await page.evaluate(async()=>{
    for(const face of document.fonts) {
      await document.fonts.load(`${parseInt(face.weight)} 20px "${face.family.replaceAll('"','')}"`);
    }
  });
  const fonts=await page.evaluate(()=>[...document.fonts].map(f=>({family:f.family,weight:f.weight,status:f.status})));
  for(const weight of ['300','400','700'])expect(fonts).toContainEqual(expect.objectContaining({family:'SK Modernist',weight,status:'loaded'}));
  expect(fonts).toContainEqual(expect.objectContaining({family:'IBM Plex Sans',status:'loaded'}));
  for(const weight of ['400','700'])expect(fonts).toContainEqual(expect.objectContaining({family:'Commit Mono',weight,status:'loaded'}));
  expect(fonts).toContainEqual(expect.objectContaining({family:'IBM Plex Mono',weight:'400',status:'loaded'}));
  await expect(page.locator('body')).toHaveCSS('font-size','17px');
});
