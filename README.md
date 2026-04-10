# 时间管理 Web

一个面向个人使用的时间管理 Web 项目，使用 `React + Vite + TypeScript` 构建，聚焦第一版 MVP：

- 新增任务
- 编辑任务
- 删除任务
- 切换完成 / 未完成
- 查看今日任务
- 查看本周任务
- 使用番茄钟
- 查看完成统计

当前版本不接后端、不接数据库、不做登录，任务和番茄钟状态都保存在浏览器 `localStorage` 中，适合先快速上线验证。

## 项目特性

- 技术栈简单，适合继续迭代
- 路由清晰，页面职责明确
- 任务数据跨页面共享，Today / Week / Stats 保持同一口径
- 刷新浏览器后任务仍然保留
- 番茄钟支持开始、暂停、重置和本地恢复

## 页面说明

- `任务总览`：主入口，负责新增任务、查看完整任务列表和切换完成状态
- `今日视图`：查看今天到期和已逾期任务，并支持就地编辑
- `本周视图`：按日期分组查看本周任务，并支持就地编辑
- `番茄钟页`：基础倒计时和状态控制
- `统计页`：展示总任务数、完成数、今日完成数、本周完成数和完成率

## 本地启动

先安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

默认本地地址通常是：

```text
http://localhost:5173
```

## 常用命令

开发：

```bash
npm run dev
```

构建：

```bash
npm run build
```

代码检查：

```bash
npm run lint
```

## 项目结构

```text
src/
  components/
  hooks/
  pages/
  router/
  styles/
  types/
  utils/
```

说明：

- `pages/`：页面组件
- `components/`：可复用 UI 组件
- `hooks/`：任务和番茄钟的状态逻辑
- `utils/`：日期处理、本地存储、统计计算等纯函数
- `types/`：TypeScript 类型定义

## 数据保存说明

当前项目使用浏览器 `localStorage` 保存数据：

- 任务：`time-manager.tasks`
- 番茄钟：`time-manager.pomodoro`

注意：

- 数据只保存在当前浏览器
- 清除浏览器缓存后数据会丢失
- 换设备不会自动同步

## 最简部署说明

当前项目已经适合部署静态前端版本。

推荐方式：**Vercel**

1. 把仓库导入 Vercel
2. Framework Preset 选择 `Vite`
3. Build Command 使用 `npm run build`
4. Output Directory 使用 `dist`
5. 点击部署

如果你使用的静态托管平台不自动处理单页应用路由，请额外配置：

```text
所有路径回退到 /index.html
```

原因是项目使用了 `React Router` 的浏览器路由模式，直接刷新 `/today`、`/week` 等页面时，需要由托管平台把请求回退到前端入口页面。

## 当前状态

目前已经完成的稳定能力：

- 项目可启动
- `npm run build` 可通过
- `npm run lint` 可通过
- 任务新增、编辑、删除、完成状态切换可用
- 跨页面数据一致
- 本地存储可恢复

## 后续建议

推荐后续优先做这些小步迭代：

1. 优化编辑任务的交互提示
2. 给任务列表补简单排序和空状态提示
3. 为番茄钟增加提示音或完成提醒
4. 增加部署平台的路由回退配置

---

相关文档：

- [产品说明书](./docs/product-spec.md)
- [技术方案](./docs/tech-plan.md)
