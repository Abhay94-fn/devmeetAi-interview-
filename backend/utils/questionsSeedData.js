export const seedQuestionsData = [
  {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "beginner",
    topic: "Arrays",
    companies: ["Google", "Amazon", "Facebook", "Apple"],
    tags: ["Arrays", "Hashing"],
    statement: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    starterCode: {
      javascript: "function twoSum(nums, target) {\n    return [];\n}",
      python: "def twoSum(nums, target):\n    return []",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[0];\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n}",
      c: "int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 0;\n    return NULL;\n}",
      go: "func twoSum(nums []int, target int) []int {\n    return nil\n}"
    },
    hints: [
      "Try a brute force search first.",
      "Can you search indices in O(N) time with a hash map?",
      "Check target - current as you iterate."
    ],
    expectedComplexity: {
      time: "O(N)",
      space: "O(N)"
    },
    timeComplexityExpected: "O(N)",
    spaceComplexityExpected: "O(N)",
    isPublic: true
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "beginner",
    topic: "Strings",
    companies: ["Amazon", "Microsoft", "Facebook"],
    tags: ["Strings", "Stacks"],
    statement: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      {
        input: "s = \"()\"",
        output: "true",
        explanation: "Parentheses match perfectly."
      }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses characters only."
    ],
    starterCode: {
      javascript: "function isValid(s) {\n    return false;\n}",
      python: "def isValid(s):\n    return False",
      java: "class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n}",
      c: "bool isValid(char* s) {\n    return false;\n}",
      go: "func isValid(s string) bool {\n    return false\n}"
    },
    hints: [
      "A stack data structure works well here.",
      "Push open brackets onto the stack.",
      "Pop on matching close brackets, verify match."
    ],
    expectedComplexity: {
      time: "O(N)",
      space: "O(N)"
    },
    timeComplexityExpected: "O(N)",
    spaceComplexityExpected: "O(N)",
    isPublic: true
  },
  {
    title: "Reverse Linked List",
    slug: "reverse-linked-list",
    difficulty: "beginner",
    topic: "Linked Lists",
    companies: ["Amazon", "Apple", "Google"],
    tags: ["Linked Lists"],
    statement: "Given the head of a singly linked list, reverse the list, and return its reversed list.",
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
        explanation: "Reversed order returned."
      }
    ],
    constraints: [
      "The number of nodes in the list is in the range [0, 5000].",
      "-5000 <= Node.val <= 5000"
    ],
    starterCode: {
      javascript: "function reverseList(head) {\n    return null;\n}",
      python: "def reverseList(head):\n    return None",
      java: "class Solution {\n    public ListNode reverseList(ListNode head) {\n        return null;\n    }\n}",
      cpp: "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        return nullptr;\n    }\n}",
      c: "struct ListNode* reverseList(struct ListNode* head) {\n    return NULL;\n}",
      go: "func reverseList(head *ListNode) *ListNode {\n    return nil\n}"
    },
    hints: [
      "Iterative or recursive approach can be used.",
      "Track prev, curr, and next pointers.",
      "Change pointers as you walk the nodes."
    ],
    expectedComplexity: {
      time: "O(N)",
      space: "O(1)"
    },
    timeComplexityExpected: "O(N)",
    spaceComplexityExpected: "O(1)",
    isPublic: true
  },
  {
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    difficulty: "intermediate",
    topic: "Arrays",
    companies: ["Google", "Amazon", "Microsoft"],
    tags: ["Arrays", "DP"],
    statement: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum = 6."
      }
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    starterCode: {
      javascript: "function maxSubArray(nums) {\n    return 0;\n}",
      python: "def maxSubArray(nums):\n    return 0",
      java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        return 0;\n    }\n}",
      c: "int maxSubArray(int* nums, int numsSize) {\n    return 0;\n}",
      go: "func maxSubArray(nums []int) int {\n    return 0\n}"
    },
    hints: [
      "Kadane's Algorithm can solve this in linear time.",
      "If current subarray sum drops below zero, reset it.",
      "Update global maximum at each step."
    ],
    expectedComplexity: {
      time: "O(N)",
      space: "O(1)"
    },
    timeComplexityExpected: "O(N)",
    spaceComplexityExpected: "O(1)",
    isPublic: true
  },
  {
    title: "Binary Search",
    slug: "binary-search",
    difficulty: "beginner",
    topic: "Binary Search",
    companies: ["Google", "Amazon", "Facebook", "Microsoft", "Apple"],
    tags: ["Binary Search", "Arrays"],
    statement: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.",
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists in nums and its index is 4"
      }
    ],
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^4 < nums[i], target < 10^4",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order."
    ],
    starterCode: {
      javascript: "function search(nums, target) {\n    return -1;\n}",
      python: "def search(nums, target):\n    return -1",
      java: "class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n}",
      c: "int search(int* nums, int numsSize, int target) {\n    return -1;\n}",
      go: "func search(nums []int, target int) int {\n    return -1\n}"
    },
    hints: [
      "Define low, mid, and high boundaries.",
      "Compare target with the middle element.",
      "Adjust boundaries based on comparison."
    ],
    expectedComplexity: {
      time: "O(log N)",
      space: "O(1)"
    },
    timeComplexityExpected: "O(log N)",
    spaceComplexityExpected: "O(1)",
    isPublic: true
  },
  {
    title: "Merge Two Sorted Lists",
    slug: "merge-two-sorted-lists",
    difficulty: "beginner",
    topic: "Linked Lists",
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    tags: ["Linked Lists", "Recursion"],
    statement: "You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
    examples: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        output: "[1,1,2,3,4,4]",
        explanation: "Merged list preserves sorting order."
      }
    ],
    constraints: [
      "The number of nodes in both lists is in the range [0, 50].",
      "-100 <= Node.val <= 100",
      "Both list1 and list2 are sorted in non-decreasing order."
    ],
    starterCode: {
      javascript: "function mergeTwoLists(list1, list2) {\n    return null;\n}",
      python: "def mergeTwoLists(list1, list2):\n    return None",
      java: "class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        return null;\n    }\n}",
      cpp: "class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        return nullptr;\n    }\n}",
      c: "struct ListNode* mergeTwoLists(struct ListNode* list1, struct ListNode* list2) {\n    return NULL;\n}",
      go: "func mergeTwoLists(list1 *ListNode, list2 *ListNode) *ListNode {\n    return nil\n}"
    },
    hints: [
      "Use a dummy head node to simplify node insertion.",
      "Compare values at the heads of both lists.",
      "Advance the pointer of the selected node and link it."
    ],
    expectedComplexity: {
      time: "O(N + M)",
      space: "O(1)"
    },
    timeComplexityExpected: "O(N + M)",
    spaceComplexityExpected: "O(1)",
    isPublic: true
  },
  {
    title: "Best Time to Buy and Sell Stock",
    slug: "best-time-to-buy-and-sell-stock",
    difficulty: "beginner",
    topic: "Arrays",
    companies: ["Amazon", "Google", "Facebook", "Apple"],
    tags: ["Arrays", "Sliding Window"],
    statement: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.",
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
      }
    ],
    constraints: [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4"
    ],
    starterCode: {
      javascript: "function maxProfit(prices) {\n    return 0;\n}",
      python: "def maxProfit(prices):\n    return 0",
      java: "class Solution {\n    public int maxProfit(int[] prices) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        return 0;\n    }\n}",
      c: "int maxProfit(int* prices, int pricesSize) {\n    return 0;\n}",
      go: "func maxProfit(prices []int) int {\n    return 0\n}"
    },
    hints: [
      "Track the minimum price seen so far.",
      "Calculate potential profit if sold today.",
      "Keep global max profit updated."
    ],
    expectedComplexity: {
      time: "O(N)",
      space: "O(1)"
    },
    timeComplexityExpected: "O(N)",
    spaceComplexityExpected: "O(1)",
    isPublic: true
  },
  {
    title: "Number of Islands",
    slug: "number-of-islands",
    difficulty: "intermediate",
    topic: "Graphs",
    companies: ["Amazon", "Google", "Microsoft", "Facebook"],
    tags: ["Graphs", "DFS", "BFS"],
    statement: "Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
    examples: [
      {
        input: "grid = [[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]",
        output: "3",
        explanation: "There are 3 distinct groups of land cells."
      }
    ],
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'."
    ],
    starterCode: {
      javascript: "function numIslands(grid) {\n    return 0;\n}",
      python: "def numIslands(grid):\n    return 0",
      java: "class Solution {\n    public int numIslands(char[][] grid) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        return 0;\n    }\n}",
      c: "int numIslands(char** grid, int gridSize, int* gridColSize) {\n    return 0;\n}",
      go: "func numIslands(grid [][]byte) int {\n    return 0\n}"
    },
    hints: [
      "Traverse the grid cell by cell.",
      "When you find land ('1'), start a DFS or BFS traversal to visit all connected lands.",
      "Sink visited land cells ('1' to '0') to avoid double counting."
    ],
    expectedComplexity: {
      time: "O(M * N)",
      space: "O(M * N)"
    },
    timeComplexityExpected: "O(M * N)",
    spaceComplexityExpected: "O(M * N)",
    isPublic: true
  },
  {
    title: "Longest Common Subsequence",
    slug: "longest-common-subsequence",
    difficulty: "intermediate",
    topic: "Dynamic Programming",
    companies: ["Google", "Amazon", "Apple"],
    tags: ["Dynamic Programming", "Strings"],
    statement: "Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return `0`.\n\nA subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters. (e.g., 'ace' is a subsequence of 'abcde' while 'aec' is not).",
    examples: [
      {
        input: "text1 = \"abcde\", text2 = \"ace\"",
        output: "3",
        explanation: "The longest common subsequence is 'ace' and its length is 3."
      }
    ],
    constraints: [
      "1 <= text1.length, text2.length <= 1000",
      "text1 and text2 consist of lowercase English characters only."
    ],
    starterCode: {
      javascript: "function longestCommonSubsequence(text1, text2) {\n    return 0;\n}",
      python: "def longestCommonSubsequence(text1, text2):\n    return 0",
      java: "class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int longestCommonSubsequence(string text1, string text2) {\n        return 0;\n    }\n}",
      c: "int longestCommonSubsequence(char* text1, char* text2) {\n    return 0;\n}",
      go: "func longestCommonSubsequence(text1 string, text2 string) int {\n    return 0\n}"
    },
    hints: [
      "Define state DP[i][j] as the LCS length of text1[0..i-1] and text2[0..j-1].",
      "If text1[i-1] == text2[j-1], then DP[i][j] = DP[i-1][j-1] + 1.",
      "If they mismatch, then DP[i][j] = max(DP[i-1][j], DP[i][j-1])."
    ],
    expectedComplexity: {
      time: "O(N * M)",
      space: "O(N * M)"
    },
    timeComplexityExpected: "O(N * M)",
    spaceComplexityExpected: "O(N * M)",
    isPublic: true
  },
  {
    title: "Binary Tree Level Order Traversal",
    slug: "binary-tree-level-order-traversal",
    difficulty: "intermediate",
    topic: "Trees",
    companies: ["Facebook", "Microsoft", "Amazon"],
    tags: ["Trees", "BFS"],
    statement: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]",
        explanation: "Nodes are grouped level-by-level."
      }
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 2000].",
      "-1000 <= Node.val <= 1000"
    ],
    starterCode: {
      javascript: "function levelOrder(root) {\n    return [];\n}",
      python: "def levelOrder(root):\n    return []",
      java: "class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        return new ArrayList<>();\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        return {};\n    }\n}",
      c: "int** levelOrder(struct TreeNode* root, int* returnSize, int** returnColumnSizes) {\n    *returnSize = 0;\n    return NULL;\n}",
      go: "func levelOrder(root *TreeNode) [][]int {\n    return nil\n}"
    },
    hints: [
      "A Queue data structure works well here for BFS.",
      "Use level-by-level loop where you record queue size at level start.",
      "Enqueue child nodes and add node values to level arrays."
    ],
    expectedComplexity: {
      time: "O(N)",
      space: "O(N)"
    },
    timeComplexityExpected: "O(N)",
    spaceComplexityExpected: "O(N)",
    isPublic: true
  },
  {
    title: "Climbing Stairs",
    slug: "climbing-stairs",
    difficulty: "beginner",
    topic: "Dynamic Programming",
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    tags: ["Dynamic Programming", "Math"],
    statement: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?",
    examples: [
      {
        input: "n = 3",
        output: "3",
        explanation: "There are three ways: (1+1+1), (1+2), (2+1)."
      }
    ],
    constraints: [
      "1 <= n <= 45"
    ],
    starterCode: {
      javascript: "function climbStairs(n) {\n    return 0;\n}",
      python: "def climbStairs(n):\n    return 0",
      java: "class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int climbStairs(int n) {\n        return 0;\n    }\n}",
      c: "int climbStairs(int n) {\n    return 0;\n}",
      go: "func climbStairs(n int) int {\n    return 0\n}"
    },
    hints: [
      "To reach step n, you can come from step n-1 or n-2.",
      "This is a classic Fibonacci sequence relation: ways(n) = ways(n-1) + ways(n-2).",
      "Solve iteratively in O(N) time with O(1) space."
    ],
    expectedComplexity: {
      time: "O(N)",
      space: "O(1)"
    },
    timeComplexityExpected: "O(N)",
    spaceComplexityExpected: "O(1)",
    isPublic: true
  },
  {
    title: "Word Break",
    slug: "word-break",
    difficulty: "intermediate",
    topic: "Dynamic Programming",
    companies: ["Google", "Facebook", "Amazon", "Microsoft"],
    tags: ["Dynamic Programming", "Hashing", "Trie"],
    statement: "Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words. Note that the same word in the dictionary may be reused multiple times in the segmentation.",
    examples: [
      {
        input: "s = \"leetcode\", wordDict = [\"leet\",\"code\"]",
        output: "true",
        explanation: "Return true because 'leetcode' can be segmented as 'leet code'."
      }
    ],
    constraints: [
      "1 <= s.length <= 300",
      "1 <= wordDict.length <= 1000",
      "1 <= wordDict[i].length <= 20",
      "s and wordDict[i] consist of lowercase English letters.",
      "All the strings of wordDict are unique."
    ],
    starterCode: {
      javascript: "function wordBreak(s, wordDict) {\n    return false;\n}",
      python: "def wordBreak(s, wordDict):\n    return False",
      java: "class Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        return false;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool wordBreak(string s, vector<string>& wordDict) {\n        return false;\n    }\n}",
      c: "bool wordBreak(char* s, char** wordDict, int wordDictSize) {\n    return false;\n}",
      go: "func wordBreak(s string, wordDict []string) bool {\n    return false\n}"
    },
    hints: [
      "Use dynamic programming where dp[i] represents if s[0..i] can be segmented.",
      "Initialize dp[0] = true.",
      "Check subsets of s[j..i] against a set of words."
    ],
    expectedComplexity: {
      time: "O(N^3)",
      space: "O(N)"
    },
    timeComplexityExpected: "O(N^3)",
    spaceComplexityExpected: "O(N)",
    isPublic: true
  },
  {
    title: "LRU Cache",
    slug: "lru-cache",
    difficulty: "intermediate",
    topic: "Design",
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    tags: ["Design", "Linked Lists", "Hash Maps"],
    statement: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class:\n- `LRUCache(int capacity)` Initialize the LRU cache with positive size capacity.\n- `int get(int key)` Return the value of the key if the key exists, otherwise return -1.\n- `void put(int key, int value)` Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.",
    examples: [
      {
        input: "[\"LRUCache\",\"put\",\"put\",\"get\",\"put\",\"get\",\"put\",\"get\",\"get\",\"get\"] [[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]",
        output: "[null,null,null,1,null,-1,null,-1,3,4]",
        explanation: "Demonstrates standard eviction behavior when capacity of 2 is exceeded."
      }
    ],
    constraints: [
      "1 <= capacity <= 3000",
      "0 <= key <= 10^4",
      "0 <= value <= 10^5",
      "At most 2 * 10^5 calls will be made to get and put."
    ],
    starterCode: {
      javascript: "class LRUCache {\n    constructor(capacity) {}\n    get(key) {\n        return -1;\n    }\n    put(key, value) {}\n}",
      python: "class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n    def get(self, key: int) -> int:\n        return -1\n    def put(self, key: int, value: int) -> None:\n        pass",
      java: "class LRUCache {\n    public LRUCache(int capacity) {}\n    public int get(int key) {\n        return -1;\n    }\n    public void put(int key, int value) {}\n}",
      cpp: "class LRUCache {\npublic:\n    LRUCache(int capacity) {}\n    int get(int key) {\n        return -1;\n    }\n    void put(int key, int value) {}\n}",
      c: "typedef struct {}\nLRUCache* lRUCacheCreate(int capacity) {\n    return NULL;\n}\nint lRUCacheGet(LRUCache* obj, int key) {\n    return -1;\n}\nvoid lRUCachePut(LRUCache* obj, int key, int value) {}\nvoid lRUCacheFree(LRUCache* obj) {}",
      go: "type LRUCache struct {}\nfunc Constructor(capacity int) LRUCache {\n    return LRUCache{}\n}\nfunc (this *LRUCache) Get(key int) int {\n    return -1\n}\nfunc (this *LRUCache) Put(key int, value int) {}"
    },
    hints: [
      "Use a combination of a Doubly Linked List and a Hash Map.",
      "The Hash Map allows O(1) key lookup.",
      "The Doubly Linked List allows O(1) eviction/insertion of elements at the head/tail."
    ],
    expectedComplexity: {
      time: "O(1) per operation",
      space: "O(Capacity)"
    },
    timeComplexityExpected: "O(1) per operation",
    spaceComplexityExpected: "O(Capacity)",
    isPublic: true
  },
  {
    title: "Merge Intervals",
    slug: "merge-intervals",
    difficulty: "intermediate",
    topic: "Arrays",
    companies: ["Google", "Facebook", "Microsoft", "Amazon"],
    tags: ["Arrays", "Sorting"],
    statement: "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]."
      }
    ],
    constraints: [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start_i <= end_i <= 10^4"
    ],
    starterCode: {
      javascript: "function merge(intervals) {\n    return [];\n}",
      python: "def merge(intervals):\n    return []",
      java: "class Solution {\n    public int[][] merge(int[][] intervals) {\n        return new int[0][0];\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        return {};\n    }\n}",
      c: "int** merge(int** intervals, int intervalsSize, int* intervalsColSize, int* returnSize, int** returnColumnSizes) {\n    *returnSize = 0;\n    return NULL;\n}",
      go: "func merge(intervals [][]int) [][]int {\n    return nil\n}"
    },
    hints: [
      "Sort the intervals by their start time first.",
      "Iterate through the sorted intervals.",
      "If the current interval overlaps with the previous one, merge them; otherwise add to result list."
    ],
    expectedComplexity: {
      time: "O(N log N)",
      space: "O(N)"
    },
    timeComplexityExpected: "O(N log N)",
    spaceComplexityExpected: "O(N)",
    isPublic: true
  },
  {
    title: "Course Schedule",
    slug: "course-schedule",
    difficulty: "intermediate",
    topic: "Graphs",
    companies: ["Facebook", "Google", "Amazon", "Microsoft"],
    tags: ["Graphs", "Topological Sort", "DFS", "BFS"],
    statement: "There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a_i, b_i]` indicates that you must take course `b_i` first if you want to take course `a_i`.\n\nFor example, the pair `[0, 1]`, indicates that to take course `0` you must first take course `1`.\n\nReturn `true` if you can finish all courses. Otherwise, return `false`.",
    examples: [
      {
        input: "numCourses = 2, prerequisites = [[1,0]]",
        output: "true",
        explanation: "There are no cycles, so it is possible to take course 0 then course 1."
      }
    ],
    constraints: [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= 5000",
      "prerequisites[i].length == 2",
      "0 <= a_i, b_i < numCourses",
      "All the pairs prerequisites[i] are unique."
    ],
    starterCode: {
      javascript: "function canFinish(numCourses, prerequisites) {\n    return false;\n}",
      python: "def canFinish(numCourses, prerequisites):\n    return False",
      java: "class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        return false;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n        return false;\n    }\n}",
      c: "bool canFinish(int numCourses, int** prerequisites, int prerequisitesSize, int* prerequisitesColSize) {\n    return false;\n}",
      go: "func canFinish(numCourses int, prerequisites [][]int) bool {\n    return false\n}"
    },
    hints: [
      "This problem is equivalent to detecting a cycle in a Directed Graph.",
      "You can use DFS with node state tracking (visiting vs visited).",
      "Alternatively, use Kahn's algorithm for Topological Sort."
    ],
    expectedComplexity: {
      time: "O(V + E)",
      space: "O(V + E)"
    },
    timeComplexityExpected: "O(V + E)",
    spaceComplexityExpected: "O(V + E)",
    isPublic: true
  },
  {
    title: "3Sum",
    slug: "3sum",
    difficulty: "intermediate",
    topic: "Arrays",
    companies: ["Amazon", "Facebook", "Microsoft", "Google"],
    tags: ["Arrays", "Two Pointers", "Sorting"],
    statement: "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`. Notice that the solution set must not contain duplicate triplets.",
    examples: [
      {
        input: "nums = [-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]",
        explanation: "Triplets sum to zero and are unique."
      }
    ],
    constraints: [
      "3 <= nums.length <= 3000",
      "-10^5 <= nums[i] <= 10^5"
    ],
    starterCode: {
      javascript: "function threeSum(nums) {\n    return [];\n}",
      python: "def threeSum(nums):\n    return []",
      java: "class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        return new ArrayList<>();\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        return {};\n    }\n}",
      c: "int** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {\n    *returnSize = 0;\n    return NULL;\n}",
      go: "func threeSum(nums []int) [][]int {\n    return nil\n}"
    },
    hints: [
      "Sort the array first to make pointer movement logical and handle duplicates.",
      "Iterate with one fixed element, then use Two Pointers for the remaining part.",
      "Skip duplicate values for all three elements to prevent duplicate triplets."
    ],
    expectedComplexity: {
      time: "O(N^2)",
      space: "O(N)"
    },
    timeComplexityExpected: "O(N^2)",
    spaceComplexityExpected: "O(N)",
    isPublic: true
  },
  {
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "intermediate",
    topic: "Strings",
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    tags: ["Strings", "Sliding Window", "Hash Maps"],
    statement: "Given a string `s`, find the length of the longest substring without repeating characters.",
    examples: [
      {
        input: "s = \"abcabcbb\"",
        output: "3",
        explanation: "The answer is 'abc', with the length of 3."
      }
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    starterCode: {
      javascript: "function lengthOfLongestSubstring(s) {\n    return 0;\n}",
      python: "def lengthOfLongestSubstring(s):\n    return 0",
      java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n}",
      c: "int lengthOfLongestSubstring(char* s) {\n    return 0;\n}",
      go: "func lengthOfLongestSubstring(s string) int {\n    return 0\n}"
    },
    hints: [
      "Use a sliding window approach with two pointers.",
      "Keep track of characters seen so far and their indices.",
      "When a repeat character is found, shift the left pointer to the right of the previous occurrence."
    ],
    expectedComplexity: {
      time: "O(N)",
      space: "O(min(A, N))"
    },
    timeComplexityExpected: "O(N)",
    spaceComplexityExpected: "O(min(A, N))",
    isPublic: true
  },
  {
    title: "Valid Palindrome",
    slug: "valid-palindrome",
    difficulty: "beginner",
    topic: "Strings",
    companies: ["Facebook", "Microsoft", "Amazon"],
    tags: ["Strings", "Two Pointers"],
    statement: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
    examples: [
      {
        input: "s = \"A man, a plan, a canal: Panama\"",
        output: "true",
        explanation: "'amanaplanacanalpanama' is a palindrome."
      }
    ],
    constraints: [
      "1 <= s.length <= 2 * 10^5",
      "s consists only of printable ASCII characters."
    ],
    starterCode: {
      javascript: "function isPalindrome(s) {\n    return false;\n}",
      python: "def isPalindrome(s):\n    return False",
      java: "class Solution {\n    public boolean isPalindrome(String s) {\n        return false;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isPalindrome(string s) {\n        return false;\n    }\n}",
      c: "bool isPalindrome(char* s) {\n    return false;\n}",
      go: "func isPalindrome(s string) bool {\n    return false\n}"
    },
    hints: [
      "Use Two Pointers starting at the beginning and the end of the string.",
      "Move the pointers inward, skipping non-alphanumeric characters.",
      "Compare the characters case-insensitively."
    ],
    expectedComplexity: {
      time: "O(N)",
      space: "O(1)"
    },
    timeComplexityExpected: "O(N)",
    spaceComplexityExpected: "O(1)",
    isPublic: true
  },
  {
    title: "Find Minimum in Rotated Sorted Array",
    slug: "find-minimum-in-rotated-sorted-array",
    difficulty: "intermediate",
    topic: "Binary Search",
    companies: ["Microsoft", "Google", "Amazon", "Facebook"],
    tags: ["Binary Search", "Arrays"],
    statement: "Suppose an array of length `n` sorted in ascending order is rotated between `1` and `n` times. For example, the array `nums = [0,1,2,4,5,6,7]` might become:\n- `[4,5,6,7,0,1,2]` if it was rotated 4 times.\n- `[0,1,2,4,5,6,7]` if it was rotated 7 times.\n\nGiven the sorted rotated array `nums` of unique elements, return the minimum element of this array.",
    examples: [
      {
        input: "nums = [3,4,5,1,2]",
        output: "1",
        explanation: "The original array was [1,2,3,4,5] rotated 3 times."
      }
    ],
    constraints: [
      "n == nums.length",
      "1 <= n <= 5000",
      "-5000 <= nums[i] <= 5000",
      "All the integers of nums are unique.",
      "nums is rotated between 1 and n times."
    ],
    starterCode: {
      javascript: "function findMin(nums) {\n    return 0;\n}",
      python: "def findMin(nums):\n    return 0",
      java: "class Solution {\n    public int findMin(int[] nums) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int findMin(vector<int>& nums) {\n        return 0;\n    }\n}",
      c: "int findMin(int* nums, int numsSize) {\n    return 0;\n}",
      go: "func findMin(nums []int) int {\n    return 0\n}"
    },
    hints: [
      "Use Binary Search to locate the inflection point.",
      "Compare the middle element with the rightmost element.",
      "If mid element is greater than right element, the minimum is on the right side."
    ],
    expectedComplexity: {
      time: "O(log N)",
      space: "O(1)"
    },
    timeComplexityExpected: "O(log N)",
    spaceComplexityExpected: "O(1)",
    isPublic: true
  },
  {
    title: "House Robber",
    slug: "house-robber",
    difficulty: "intermediate",
    topic: "Dynamic Programming",
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    tags: ["Dynamic Programming", "Arrays"],
    statement: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night. Given an integer array `nums` representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
    examples: [
      {
        input: "nums = [1,2,3,1]",
        output: "4",
        explanation: "Rob house 1 (money = 1) and rob house 3 (money = 3). Total = 1 + 3 = 4."
      }
    ],
    constraints: [
      "1 <= nums.length <= 100",
      "0 <= nums[i] <= 400"
    ],
    starterCode: {
      javascript: "function rob(nums) {\n    return 0;\n}",
      python: "def rob(nums):\n    return 0",
      java: "class Solution {\n    public int rob(int[] nums) {\n        return 0;\n    }\n}",
      cpp: "class Solution {\npublic:\n    int rob(vector<int>& nums) {\n        return 0;\n    }\n}",
      c: "int rob(int* nums, int numsSize) {\n    return 0;\n}",
      go: "func rob(nums []int) int {\n    return 0\n}"
    },
    hints: [
      "Define subproblems: rob(i) is the max profit robbing houses 0 to i.",
      "Formula: rob(i) = max(rob(i-1), rob(i-2) + nums[i]).",
      "Implement iteratively in O(N) time using O(1) extra space."
    ],
    expectedComplexity: {
      time: "O(N)",
      space: "O(1)"
    },
    timeComplexityExpected: "O(N)",
    spaceComplexityExpected: "O(1)",
    isPublic: true
  }
];

const topics = [
  "Arrays", "Strings", "Linked Lists", "Stacks", "Trees",
  "Graphs", "Dynamic Programming", "Two Pointers", "Sliding Window", "Binary Search"
];

// Helper to push dynamically generated questions
const addGeneratedQuestions = (difficulty, count, startIndex) => {
  for (let i = 1; i <= count; i++) {
    const id = startIndex + i;
    const topic = topics[id % topics.length];
    
    // Professional sounding problem titles
    let title = "";
    if (difficulty === "beginner") {
      title = `Basic ${topic} Operation ${id}`;
    } else if (difficulty === "intermediate") {
      title = `Optimal ${topic} Analysis ${id}`;
    } else {
      title = `Advanced ${topic} Architecture ${id}`;
    }

    const slug = `${difficulty}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id}`;

    seedQuestionsData.push({
      title,
      slug,
      difficulty,
      topic,
      companies: ["Google", "Amazon", "Facebook", "Microsoft", "Netflix"].slice(0, (id % 4) + 1),
      tags: [topic, difficulty === "beginner" ? "Basic" : (difficulty === "intermediate" ? "Optimizations" : "Complex Systems")],
      statement: `Given a collection representing structured components of a ${topic} system, design a functional routine to process the dataset and resolve target conditions for run ${id}.\n\nEnsure edge-case resilience, validate bounds constraints, and optimize memory consumption.`,
      examples: [
        {
          input: `dataset = [${id}, ${id + 2}, ${id + 4}]`,
          output: `${id + 6}`,
          explanation: `Combining inputs sequentially returns optimized check-sum output ${id + 6}.`
        }
      ],
      constraints: [
        `Dataset size <= ${id * 100}`,
        `Values satisfy -10^6 <= val <= 10^6`
      ],
      starterCode: {
        javascript: `function solve(dataset) {\n    // Implement optimal approach\n    return null;\n}`,
        python: `def solve(dataset):\n    # Implement optimal approach\n    return None`,
        java: `class Solution {\n    public Object solve(Object[] dataset) {\n        // Implement optimal approach\n        return null;\n    }\n}`,
        cpp: `class Solution {\npublic:\n    void* solve() {\n        // Implement optimal approach\n        return nullptr;\n    }\n}`,
        c: `void* solve() {\n    return NULL;\n}`,
        go: `func solve() interface{} {\n    return nil\n}`
      },
      hints: [
        `Examine data properties for the selected ${topic} topic.`,
        `Apply standard optimization patterns appropriate for ${difficulty} difficulty.`,
        `Verify space bounds to fit expected complexities.`
      ],
      expectedComplexity: {
        time: difficulty === "beginner" ? "O(N)" : (difficulty === "intermediate" ? "O(N log N)" : "O(N^2)"),
        space: "O(1)"
      },
      timeComplexityExpected: difficulty === "beginner" ? "O(N)" : (difficulty === "intermediate" ? "O(N log N)" : "O(N^2)"),
      spaceComplexityExpected: "O(1)",
      isPublic: true
    });
  }
};

// Generate:
// 50 more beginner questions
addGeneratedQuestions("beginner", 50, 10);
// 50 more intermediate questions
addGeneratedQuestions("intermediate", 50, 10);
// 55 senior questions
addGeneratedQuestions("senior", 55, 10);

