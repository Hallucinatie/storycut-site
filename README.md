# StoryCut 网站

StoryCut 把一篇论文讲成有出处的中文视频：读懂全文和图表、核对关键数字、写成讲解、配音并渲染成片。

这个仓库只放产品介绍网站（静态页面，GitHub Pages 发布）：

- `index.html`：首页，样片、镜头动效和功能介绍
- `workbench.html`：工作台界面预览（截图）；完整工作台需要在本机运行

页面上的样片、截图和动效片段都来自 StoryCut 对 Voyager 论文（arXiv 2305.16291）生成的讲解，
论文原图版权归原作者所有。放大区域部分经人工核对。动效 `m_formula` 来自公式讲解演示（Transformer 注意力），不属于 Voyager。

动效使用 [Motion](https://motion.dev)（`vendor/motion-12.4.7.js`，MIT）。
