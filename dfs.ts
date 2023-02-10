interface TreeNode {
  left?: TreeNode;
  right?: TreeNode;
  value: number;
}

const tree: TreeNode = {
  value: 4,
  left: {
    value: 7,
    left: {
      value: 10,
    },
    right: {
      value: 2,
      right: {
        value: 6,
        left: {
          value: 2,
        },
      },
    },
  },
  right: {
    value: 9,
    right: {
      value: 6,
    },
  },
};

const result: number[] = [];

function dfs(node: TreeNode): TreeNode | undefined {
  if (node === undefined) return;
  result.push(node.value);

  return dfs(node.left) ?? dfs(node.right);
}

const x: number[][] = [[]];

function average() {
  const depth = 0;

  const keys = tree;
}

console.log(dfs(tree));
// console.log(average(tree));
