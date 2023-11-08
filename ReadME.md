https://segmentfault.com/a/1190000014641724
#手撸虚拟DOM
###设计
#采用跟React、PReact类似的思想结构
# 1. 使用JSX来编写组件
    # 1.1 利用babel将JSX编译成JS（暂且称为hyperscript:HScript）
# 2. 将HScript转换成我们的VDOM
# 3. 将VDOM渲染到页面 形成真实DOM
# 5. 手动更新数据并触发更新输入操作
# 6. 重复步骤2、步骤3，得到最新VDOM
# 7. 利用diff算法比较新旧VDOM，得到需要更新DOM的patchs
# 8. 利用patchs批量更新DOM
