# Celebration Fireworks App

This is a high-performance React application simulating fireworks using the HTML5 Canvas API.

## 1. Running Locally
1. Install dependencies: `npm install`
2. Start server: `npm start` (or `vite` if using Vite)

## 2. Deployment (Web)
This project is a static Single Page Application (SPA).
1. Build the project: `npm run build`
2. Deploy the `dist` or `build` folder to any static host:
   - **Vercel**: Import project -> Deploy.
   - **Netlify**: Drag and drop build folder.
   - **GitHub Pages**: Use `gh-pages` branch.

## 3. Creating a WeChat Mini Program (微信小程序)

Since this is a React Web App, the fastest way to turn it into a WeChat Mini Program is using the `<web-view>` component.

### Step 1: Deploy to HTTPS
Deploy this React app to a secure server (must be **HTTPS**), e.g., `https://my-fireworks.vercel.app`.

### Step 2: Create Mini Program
1. Register at [WeChat Official Accounts Platform](https://mp.weixin.qq.com/).
2. Download **WeChat DevTools**.
3. Create a new "Mini Program" project (select "JavaScript" template).

### Step 3: Configure Domain
In the WeChat Dashboard (mp.weixin.qq.com):
1. Go to **Development Management** > **Development Settings**.
2. Add your deployed URL (`https://my-fireworks.vercel.app`) to the **Business Domain** (业务域名) list.
   *Note: You may need to upload a validation file to your server root.*

### Step 4: Mini Program Code
Replace the contents of `pages/index/index.wxml` with:

```xml
<web-view src="https://my-fireworks.vercel.app"></web-view>
```

---

## 4. Native Mini Program Version (原生小程序版)

如果你不想使用网页内嵌 (`web-view`)，想直接写原生的微信小程序代码（即使用 `.js`, `.wxml`, `.wxss`），请参考以下代码：

### 1. `pages/index/index.wxml`
```html
<view class="container">
  <!-- 2D Canvas -->
  <canvas type="2d" id="fireworksCanvas" class="canvas" bindtouchstart="handleTouch"></canvas>
  
  <view class="controls">
    <button class="btn" bindtap="launch">放烟花</button>
  </view>
</view>
```

### 2. `pages/index/index.wxss`
```css
page {
  background-color: #000;
  height: 100vh;
  overflow: hidden;
}
.canvas {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
.controls {
  position: absolute;
  bottom: 50px;
  width: 100%;
  z-index: 2;
  display: flex;
  justify-content: center;
}
.btn {
  background: linear-gradient(to right, #ef4444, #f59e0b);
  color: white;
  border-radius: 99px;
  padding: 10px 30px;
  font-weight: bold;
}
```

### 3. `pages/index/index.js`
```javascript
Page({
  data: {},
  onReady() {
    const query = wx.createSelectorQuery()
    query.select('#fireworksCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)

        this.canvas = canvas
        this.ctx = ctx
        this.fireworks = []
        this.particles = []
        this.width = res[0].width
        this.height = res[0].height
        
        // Start Loop
        this.loop()
      })
  },

  loop() {
    if (!this.ctx) return
    const ctx = this.ctx
    
    // Clear / Trail effect
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalCompositeOperation = 'lighter';

    // Update fireworks & particles (Simplified logic)
    // ... Copy logic from the React FireworksEngine.tsx update() methods here ...
    // You will need to adapt 'fireworksRef.current' to 'this.fireworks'

    this.drawFireworks()
    
    // WeChat's requestAnimationFrame
    canvas.requestAnimationFrame(() => this.loop())
  },

  drawFireworks() {
      // Implementation of drawing logic goes here
      // Refer to the FireworksEngine.tsx file for the math
  },

  launch() {
    // Logic to add a new Firework to this.fireworks array
    console.log("Launch!")
  },
  
  handleTouch(e) {
      // Get touch coordinates and launch
  }
})
```

## FAQ

**Q: What is `.ts` / `.tsx`?**
A: `.ts` stands for **TypeScript**. It is a typed superset of JavaScript.
- `.tsx` is used for **React components** (HTML-like syntax inside JS).
- WeChat DevTools supports TypeScript if you select the "TypeScript" template when creating a project.
- If you select the "JavaScript" template, you should use `.js` files.

**Q: Can I copy the React code directly to WeChat?**
A: No. React code runs in a browser environment. WeChat Mini Programs use a different framework (`WXML` instead of HTML, `WXSS` instead of CSS). You must either use `<web-view>` (embedded website) or rewrite the logic in native JS as shown above.
