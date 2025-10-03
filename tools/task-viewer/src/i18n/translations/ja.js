export const translations = {
  // Header
  appTitle: "🦐 Shrimp Task Manager Viewer",
  version: "バージョン",
  releaseNotes: "リリースノート",
  help: "ヘルプ",
  language: "言语",
  
  // Navigation tabs
  tasks: "タスク",
  templates: "テンプレート",
  projects: "プロジェクト",
  
  // Template Management
  templateManagement: "🎨 テンプレート管理",
  templateManagementDesc: "すべてのタスクマネージャー机能のプロンプトテンプレートを管理します。テンプレートを编集、拷贝、またはリセットしてAIの动作をカスタマイズしましょう。",
  exportTemplates: "📤 テンプレートエクスポート",
  exportTemplatesDesc: "テンプレート设置をエクスポートしてチームと共有したり、后で使用するためにバックアップしたりしましょう",
  
  // Template columns
  function: "机能",
  description: "说明",
  status: "ステータス",
  actions: "アクション",
  
  // Template statuses
  statusDefault: "デフォルト",
  statusCustom: "カスタム",
  statusCustomAppend: "カスタム+追加",
  
  // Template actions
  edit: "编集",
  editTemplate: "✏️ テンプレート编集",
  preview: "プレビュー",
  previewTemplate: "プレビュー: {name}",
  duplicate: "拷贝",
  duplicateTemplate: "📋 テンプレート拷贝",
  activate: "アクティベート",
  activateTemplate: "🚀 テンプレートアクティベート",
  reset: "リセット",
  resetToDefault: "デフォルトテンプレートにリセット",
  
  // Common actions
  save: "保存",
  cancel: "キャンセル",
  back: "戻る",
  backToTemplates: "← テンプレートに戻る",
  close: "闭じる",
  
  // Duplicate Template View
  whyDuplicate: "📚 なぜテンプレートを拷贝するのか？",
  duplicateExplanation: "テンプレートの拷贝により、异なる使用ケースに対応した既存テンプレートの専门版を作成できます：",
  createVariations: "🎯 バリエーションの作成",
  createVariationsDesc: "异なるコンテキスト用の専门バージョンを作成：",
  safeExperimentation: "🧪 安全な実験",
  safeExperimentationDesc: "作业テンプレートに影响を与えることなく変更をテスト：",
  templateLibraries: "📂 テンプレートライブラリ",
  templateLibrariesDesc: "関连テンプレートのコレクションを构筑：",
  versionManagement: "💾 バージョン管理",
  versionManagementDesc: "异なるニーズに対応する异なるバージョンを保持：",
  
  // Duplicate form
  createDuplicate: "📝 拷贝作成",
  originalTemplate: "元のテンプレート",
  newTemplateName: "新しいテンプレート名",
  required: "*",
  nameHint: "この拷贝の目的やバリエーションを示す说明的な名前を选択してください",
  whatWillHappen: "📋 実行される内容：",
  createNewTemplate: "新しいテンプレートを作成",
  copyContent: "コンテンツをコピー",
  independentEditing: "独立した编集",
  readyToUse: "使用准备完了",
  
  // Export Templates
  exportTemplateConfigurations: "テンプレート设置のエクスポート",
  exportFormat: "エクスポート形式：",
  exportOnlyModified: "変更されたテンプレートのみをエクスポート（推奨）",
  exportHint: "チェックすると、カスタマイズまたは上书きされたテンプレートのみがエクスポートされます",
  
  // Activation Dialog
  whatIsEnvVar: "📋 环境変数とは何ですか？",
  envVarExplanation: "环境変数は、プログラムが开始时に読み取ることができる设置です。MCPサーバーはカスタムテンプレート変数をチェックして、デフォルトのプロンプトを上书きします。{envVar}を设置することで、MCPサーバーに组み込みのテンプレートではなく编集されたテンプレートを使用するよう指示します。",
  whyNeedThis: "なぜこれが必要なのですか？",
  whyNeedThisExplanation: "ClaudeがMCPサーバーを起动するとき、これらの环境変数を読み取って応答方法をカスタマイズします。この変数を设置しないと、テンプレートの编集が使用されません。",
  howToSetVariable: "🚀 この変数を设置する方法",
  chooseCommand: "设置に基づいて以下から适切なコマンドを选択してください。これらのコマンドは、Claudeが起动时に使用できるように、シェル设置ファイル（~/.bashrcや~/.zshrcなど）に変数をエクスポートします。",
  
  // Messages
  loading: "ローディング中...",
  error: "エラー",
  success: "成功",
  noTemplatesFound: "テンプレートが见つかりません",
  failedToLoad: "ロードに失败しました",
  
  // Pagination
  showing: "表示中",
  to: "〜",
  of: "/",
  page: "ページ",
  filteredFrom: "でフィルタリング",
  total: "総计",
  
  // Statistics
  totalTemplates: "総テンプレート数",
  totalNumberOfTemplates: "総テンプレート数",
  numberOfDefaultTemplates: "デフォルトテンプレート数",
  numberOfCustomTemplates: "カスタムテンプレート数",
  numberOfEnvOverrideTemplates: "环境オーバーライドテンプレート数",
  default: "デフォルト",
  custom: "カスタム", 
  envOverride: "环境オーバーライド",
  
  // Project management
  readme: "リードミー",
  addTab: "プロジェクト追加",
  history: "履歴",
  viewProjectHistory: "プロジェクト履歴を表示",
  totalTasks: "総タスク数",
  completed: "完了済み",
  inProgress: "进行中",
  pending: "保留中",
  autoRefresh: "自动リフレッシュ",
  
  // History management
  backToTasks: "タスクに戻る",
  backToHistory: "履歴に戻る",
  projectHistory: "プロジェクト履歴",
  dateTime: "日付/时刻",
  taskCount: "タスク数",
  notes: "ノート",
  statusSummary: "ステータス要约",
  viewTasks: "タスクを表示",
  noHistoryFound: "履歴が见つかりません",
  noHistoryDescription: "このプロジェクトに利用可能な履歴タスクスナップショットはありません",
  historyRowTitle: "履歴エントリ - 详细を表示するには「タスクを表示」をクリック",
  historyEntries: "履歴エントリ",
  tasksFrom: "タスクの出典",
  taskName: "タスク名",
  noDependencies: "なし",
  created: "作成日",
  noTasksFound: "タスクが见つかりません",
  noTasksMessage: "tasks.jsonファイルがまだ作成されていません。タスクを生成するには、このフォルダでshrimpを実行してください。",
  noTasksInHistory: "この履歴スナップショットにはタスクが含まれていません",
  taskRowTitle: "履歴スナップショットからのタスク详细",
  
  // Search and UI
  searchTemplatesPlaceholder: "🔍 テンプレートを検索...",
  searchTemplatesTitle: "机能名または说明でテンプレートを検索およびフィルタリング",
  refreshTemplateData: "テンプレートデータを更新",
  searchTasksPlaceholder: "🔍 タスクを検索...",
  searchTasksTitle: "任意のテキスト内容でタスクを検索およびフィルタリング",
  refreshCurrentProfile: "现在のプロジェクトデータを更新 - ファイルからタスクを再読み込み",
  
  // Project management
  editProjectSettings: "プロジェクト设置编集",
  chooseProfileTitle: "上のドロップダウンからプロジェクトを选択してください",
  selectProfileToViewTasks: "タスクを表示するプロジェクトを选択してください",
  noProfilesAvailable: "利用可能なプロジェクトがありません",
  noProfilesClickAddTab: "利用可能なプロジェクトがありません。「プロジェクト追加」をクリックして作成してください。",
  loadingTasksFromFile: "ファイルからタスクを読み込み中",
  loadingTasks: "タスク読み込み中... ⏳",
  
  // Add/Edit Project forms
  addNewProfile: "新しいプロジェクトを追加",
  profileName: "プロジェクト名",
  profileNamePlaceholder: "例：チーム・アルファ・タスク",
  profileNameTitle: "このプロジェクトの说明的な名前を入力してください",
  taskFolderPath: "タスクフォルダパス",
  taskFolderPathPlaceholder: "/path/to/shrimp_data_folder",
  taskFolderPathTitle: "tasks.jsonを含むshrimpデータフォルダのパスを入力してください",
  tip: "ヒント",
  navigateToFolder: "ターミナルでshrimpデータフォルダに移动し、",
  typePwd: "pwdと入力してフルパスを取得してください",
  example: "例",
  projectRootPath: "プロジェクトルートパス",
  projectRootPlaceholder: "例：/home/user/my-project",
  projectRootTitle: "プロジェクトルートディレクトリの绝対パスを入力してください",
  projectRootHint: "これによりVS Codeで开くクリック可能なファイルリンクが有効になります",
  optional: "オプション",
  addProfile: "プロジェクト追加",
  cancelAndCloseDialog: "キャンセルしてこのダイアログを闭じます",
  addProject: "プロジェクト追加",
  
  // Edit Project specific
  projectRoot: "プロジェクトルート",
  taskPath: "タスクパス",
  editProfileNameTitle: "プロジェクト名を编集",
  projectRootEditPlaceholder: "例：/home/user/projects/my-project",
  projectRootEditTitle: "VS Codeファイルリンクを有効にするためにプロジェクトルートパスを设置",
  projectRootEditHint: "タスクファイル用のクリック可能なVS Codeリンクを有効にするためにこれを设置してください",
  taskPathPlaceholder: "/path/to/shrimp_data_folder/tasks.json",
  taskPathTitle: "このプロジェクトのtasks.jsonファイルのパスを编集",
  taskPathHint: "プロジェクトのタスクデータを含むtasks.jsonファイルのパス",
  saveChanges: "変更を保存",
  
  // Toast messages with parameters
  profileAddedSuccess: "プロジェクト\"{name}\"が正常に追加されました！",
  profileRemovedSuccess: "プロジェクト\"{name}\"が正常に削除されました！",
  templateSavedSuccess: "テンプレート\"{name}\"が正常に保存されました！",
  templateResetSuccess: "テンプレート\"{name}\"がデフォルトにリセットされました！",
  templateDuplicatedSuccess: "テンプレートが\"{name}\"として拷贝されました！",
  rememberToRestartClaude: "💡 环境変数を设置した后にClaude Codeを再起动することを忘れずに",
  
  // Confirmation dialogs
  confirmRemoveProfile: "このプロジェクトを削除してもよろしいですか？この操作は元に戻せません。",
  confirmResetTemplate: "{name}をデフォルトにリセットしてもよろしいですか？すべてのカスタマイゼーションが削除されます。",
  
  // Template activation
  defaultTemplateAlreadyActive: "デフォルトテンプレートはすでにアクティブです - アクティベーションは不要です",
  
  // Duplicate Template View additional keys
  noTemplateSelected: "テンプレートが选択されていません",
  pleaseEnterDuplicateName: "拷贝テンプレートの名前を入力してください",
  duplicateNameMustBeDifferent: "拷贝名は元の名前と异なる必要があります",
  failedToDuplicateTemplate: "テンプレートの拷贝に失败しました",
  backToTemplateList: "テンプレートリストに戻る",
  creatingDuplicate: "拷贝作成中...",
  
  // Task Table
  task: "タスク",
  taskName: "タスク名",
  created: "作成日",
  updated: "更新日",
  dependencies: "依存関系",
  noTasksFound: "このプロジェクトではタスクが见つかりませんでした",
  noDescriptionProvided: "说明が提供されていません",
  viewTask: "タスクを表示",
  clickToCopyUuid: "UUIDをクリップボードにコピーするにはクリックしてください",
  copyTaskInstruction: "クリップボードに以下をコピー：タスクマネージャーを使用してこのshrimpタスクを完了",
  useTaskManager: "タスクマネージャーを使用してこのshrimpタスクを完了",
  clickToViewTaskDetails: "タスクの详细を表示するにはクリックしてください",
  
  // Template Editor
  saving: "保存中...",
  saveTemplate: "テンプレート保存",
  
  // Project Settings
  projectSettings: "プロジェクト设置",
  settingsSaved: "设置が正常に保存されました",
  settings: "设置",
  
  // Global Settings
  globalSettings: "グローバル设置",
  claudeFolderPath: "Claudeフォルダパス",
  claudeFolderPathDesc: "Claudeフォルダパスを指定すると、サブエージェントとフック设置にアクセスできます",
  claudeFolderPathPlaceholder: "例：~/.config/claude",
  
  // Task messages
  taskSavedSuccess: "タスクが正常に保存されました",
  confirmDeleteTask: "このタスクを削除してもよろしいですか？",
  taskDeletedSuccess: "タスクが正常に削除されました",
  deleteTask: "タスク削除",
  
  // Agent functionality
  subAgents: "サブエージェント",
  agents: "エージェント", 
  agentName: "エージェント名",
  type: "タイプ",
  viewAgent: "エージェント表示",
  editAgent: "エージェント编集",
  noAgentsFound: "エージェントが见つかりません",
  agentSavedSuccess: "エージェントが正常に保存されました",
  aiInstruction: "AI指示"
};