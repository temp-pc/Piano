class Task {
  constructor(title) {
    this.title = title;
    this.isCompleted = false;
  }

  complete() {
    this.isCompleted = true;
  }

  getStatus() {
    return this.isCompleted ? "✅ 完了" : "❌ 未完了";
  }
}

class TaskManager {
  constructor() {
    this.tasks = [];
  }

  addTask(task) {
    this.tasks.push(task);
  }

  removeTask(title) {
    this.tasks = this.tasks.filter(task => task.title !== title);
  }

  showTasks() {
    console.log("📋 タスク一覧:");
    this.tasks.forEach(task => {
      console.log(`- ${task.title}: ${task.getStatus()}`);
    });
  }
}

// インスタンス作成
const manager = new TaskManager();
const task1 = new Task("JavaScriptの勉強");
const task2 = new Task("ランニング");

manager.addTask(task1);
manager.addTask(task2);

manager.showTasks();
// 📋 タスク一覧:
// - JavaScriptの勉強: ❌ 未完了
// - ランニング: ❌ 未完了

task1.complete();
manager.showTasks();
// 📋 タスク一覧:
// - JavaScriptの勉強: ✅ 完了
// - ランニング: ❌ 未完了

manager.removeTask("ランニング");
manager.showTasks();
// 📋 タスク一覧:
// - JavaScriptの勉強: ✅ 完了

