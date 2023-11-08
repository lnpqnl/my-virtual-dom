// diff 操作结果常量
const CREATE = "CREATE"; //新增一个节点
const REMOVE = "REMOVE"; //删除原节点
const REPLACE = "REPLACE"; //替换原节点
const UPDATE = "UPDATE"; //检查属性或子节点是否有变化
const SET_PROP = "SET_PROP"; //新增或替换属性
const REMOVE_PROP = "REMOVE PROP"; //删除属性

// function view() {
//   return (
//     <ul id="filmList" className="list">
//       <li className="main">Detective Chinatown Vol 2</li>
//       <li>Ferdinand</li>
//       <li>Paddington 2</li>
//       {/* <ul>
//         <li>ul_Ferdinand</li>
//         <li>ul_Paddington 2</li>
//       </ul> */}
//     </ul>
//   );
// }

function view(count) {
  const r = [...Array(count).keys()];
  return h(
    "ul",
    { id: "filmList", className: `list list-${count % 3}` },
    h(
      "li",
      null,
      "item default"
    ),
    r.map(n => h(
      "li",
      { className: "main" },
      `item ${(count * n).toString()}`
    ))
  );
}

/**
 * @description: 模版编译函数 等价于React中的React.createElement
 * @param {*} type
 * @param {*} props
 * @param {array} children
 * @return {*} 返回VNode对象
 */
const h = (type, props, ...children) => {
  return {
    type,
    props: props || {},
    // children可能为两层嵌套[[{},{}]]
    children: [].concat(...children)
  };
};

/**
 * @description: VNode => DOMNode
 * @param {*} VNode
 * @return {*} DOMNode
 */
const createElement = VNode => {
  // 递归出口
  if (typeof VNode === "string") {
    return document.createTextNode(VNode);
  }
  let { type, props, children = [] } = VNode;
  const el = document.createElement(type);
  // 设置DOM属性
  setProps(el, props || {});
  // 递归渲染子元素
  children.forEach(child => el.appendChild(createElement(child)));

  return el;
};

const setProps = (target, props) => {
  Object.keys(props).forEach(key => {
    setProp(target, key, props[key]);
  });
};

const setProp = (target, key, value) => {
  if (key === "className") {
    return target.setAttribute("class", value);
  }
  target.setAttribute(key, value);
};

function removeProp(target, key) {
  if (key === 'className') {
    return target.removeAttribute('class');
  }

  target.removeAttribute(key);
}

/**
 * @description: 新旧node diff
 * @param {*} oldNode
 * @param {*} newNode
 * @return {*}
 * patches: {
 * type: ,
 * props: ,
 * children: ,
 * }
 */
const diff = (oldNode, newNode) => {
  if (!oldNode) return { type: CREATE, newNode };
  if (!newNode) return { type: REMOVE, oldNode };
  if (isChanged(oldNode, newNode)) return { type: REPLACE, newNode };

  if (newNode.type) {
    return {
      type: UPDATE,
      props: diffProps(oldNode.props, newNode.props),
      children: diffChildren(oldNode.children, newNode.children)
    };
  }
};

/**
 * @description: 检查新旧节点 整体是否发生变动 变动则替换即可
 * @param {*} oldNode
 * @param {*} newNode
 * @return {boolean}
 */
const isChanged = (oldNode, newNode) => {
  return typeof oldNode !== typeof newNode || typeof oldNode === "string" && oldNode !== newNode || oldNode.type !== newNode.type;
};

const diffProps = (oldProps, newProps) => {
  let patches = [];
  // 最大可能性原则
  let props = Object.assign({}, oldProps, newProps);
  for (let key in props) {
    const oldVal = oldProps[key];
    const newVal = newProps[key];
    if (!newVal) {
      patches.push({ type: REMOVE_PROP, key, value: oldVal });
    }
    if (!oldVal || oldVal !== newVal) {
      patches.push({ type: SET_PROP, key, value: newVal });
    }
  }

  return patches;
};

const diffChildren = (oldChildren, newChildren) => {
  let patches = [];
  const maxLength = Math.max(oldChildren.length, newChildren.length);
  // 依次比较新旧VDOM的在相同INDEX下的每一个child
  // TODO 注意这里没有加入key的概念。存在性能损耗
  for (let i = 0; i < maxLength; i++) {
    patches[i] = diff(oldChildren[i], newChildren[i]);
  }
  return patches;
};

const patch = (parent, patches, index = 0) => {
  if (!patches) return;
  const el = parent.childNodes[index];
  switch (patches.type) {
    case CREATE:
      {
        const { newNode } = patches;
        const newEl = createElement(newNode);
        parent.appendChild(newEl);
      }
      break;
    case REMOVE:
      {
        parent.removeChild(el);
        break;
      }

    case REPLACE:
      {
        const { newNode } = patches;
        const newEl = createElement(newNode);
        return parent.replaceChild(newEl, el);
      }

    case UPDATE:
      {
        const { props, children } = patches;
        patchProps(el, props);
        // 递归
        for (let i = 0; i < children.length; i++) {
          patch(el, children[i], i);
        }
      }

    default:
      break;
  }
};

const patchProps = (target, propsPatches) => {
  for (const patch of propsPatches) {
    const { type, key, value } = patch;
    if (type === SET_PROP) {
      setProp(target, key, value);
    }
    if (type === REMOVE_PROP) {
      removeProp(target, key);
    }
  }
};
