# Polyagent 前端产品与界面说明（当前版本）

## 1. 项目定位与目标

Polyagent 是一个面向“预测市场基金”场景的前端平台，连接两类用户：

- 投资人：查看基金、进行 `deposit/redeem`、跟踪个人投资表现。
- 基金经理：管理基金信息、查看管理数据、配置和提交交易意图。

项目核心目标是把基金信息展示、资金申赎交互和基金管理流程放在同一套 Web 体验里，并通过钱包与链上交互实现关键动作。

## 2. 核心功能模块

### 2.1 全局公共功能

- 固定顶部导航与模块入口（Funds / My Investments / Fund Management）。
- 钱包连接与 SIWE 登录。
- 基于登录态和角色的导航显隐与页面访问控制。
- 中英文切换（导航和钱包相关文案已本地化）。
- 404 页面与全局异常页面（保留导航和页面框架）。

### 2.2 投资人功能

- 基金列表浏览：搜索、分页、状态与关键指标查看。
- 基金详情查看：基础信息、业绩图、持仓、投资人排行、交易记录。
- 交易面板：支持 Deposit/Redeem，链上读取 vault/baseAsset/allowance/shares。
- 我的投资：组合总览卡片、投资基金列表、单基金投资详情与交易记录。

### 2.3 基金经理功能

- 管理总览：基金数量、投资人数、资金规模等统计卡片。
- 管理列表：按基金查看管理信息，进入管理详情页。
- 新建基金弹窗：填写基础信息、策略与规则（当前为前端表单交互）。
- 管理详情：基金信息编辑、业绩、持仓、交易记录、执行意图列表。
- 管理操作面板：市场链接解析与交易意图参数配置（当前为 UI 原型交互）。

## 3. 整体界面与布局结构

### 3.1 页面框架

- 顶部：固定导航栏。
- 主区域：居中容器（最大宽度 `1440px`），统一留白和纵向节奏。
- 信息组织：以卡片、表格、图表为主。

### 3.2 典型布局模式

- 列表页（Funds / My Investments / Fund Management）：
  - 顶部标题卡片
  - 中部统计卡片
  - 下方数据表格与分页
- 详情页（Fund Detail / Investment Detail / Manager Detail）：
  - 左侧 2/3：基础信息 + KPI + 图表 + 明细表
  - 右侧 1/3：粘性操作面板（Trade Panel 或 Management Action Panel）

### 3.3 权限与导航关系

- `Funds` 对所有访问者可见。
- `My Investments` 需要登录。
- `Fund Management` 需要登录且角色为 `MANAGER`。
- 未登录或无权限时，页面内容区显示对应提示卡片。

## 4. 页面清单与功能说明

### 4.1 `/`（首页）

- 作用：入口转发页。
- 行为：自动重定向到 `/market/funds`。

### 4.2 `/market/funds`（基金列表）

- 作用：基金发现与初筛。
- 主要内容：
  - 头部说明
  - 平台统计卡片（Fund Count / Total Investors / Total Invested / Total Value）
  - 基金表格（含搜索、分页、详情入口）

### 4.3 `/market/funds/[id]`（基金详情）

- 作用：查看单基金全景信息并发起申赎。
- 主要内容：
  - 基础信息（含 Vault、Manager、创建时间）
  - KPI 指标
  - Strategy
  - Performance (NAV) 图
  - Top Positions / Top Investors / Recent Transactions
  - 右侧 Trade Panel（Deposit / Redeem）

### 4.4 `/investment/funds`（我的投资列表）

- 作用：查看个人投资组合与持仓基金。
- 主要内容：
  - 头部说明
  - 个人统计卡片（投资基金数、总投入、总价值、累计 PnL）
  - 投资表格（含搜索、分页、详情入口）

### 4.5 `/investment/funds/[fundId]`（投资详情）

- 作用：查看个人在单基金上的持仓与收益表现，并继续申赎。
- 主要内容：
  - 基础信息（含基金描述、Vault、Manager）
  - 持仓与收益 KPI
  - Value Trend 图
  - Recent Transactions
  - 右侧共享 Trade Panel

### 4.6 `/manager`（基金管理列表）

- 作用：基金经理查看管理总览并管理基金。
- 主要内容：
  - 头部说明
  - 管理统计卡片
  - Managed Funds 列表
  - `Create Fund` 按钮与弹窗

### 4.7 `/manager/[id]`（基金管理详情）

- 作用：基金经理管理单只基金的配置与执行流程。
- 主要内容：
  - Fund Operations / Strategy / Rules（可编辑）
  - Overview KPI
  - Performance (NAV)
  - Holdings / Transactions
  - Execution Intents（含分页）
  - 右侧 Management Action Panel（市场解析与交易参数配置）

### 4.8 `not-found` 与 `error`（系统页）

- 作用：统一处理路由不存在和运行时异常。
- 表现：保留全局导航与页面结构，仅在内容区显示提示卡片和返回按钮。
