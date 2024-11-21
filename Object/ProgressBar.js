const cliProgress = require("cli-progress");

class ProgressBar {
  constructor(totalStep, desc, message) {
    this.totalStep = totalStep;
    this.desc = desc;
    this.message = message;
    this.currentStep = 0;
    this.createProgressBar();
  }

  createProgressBar() {
    console.log(this.message);
    this.progressBar = new cliProgress.SingleBar({
      format: "Progress |{bar}| {value}/{total} " + this.desc,
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: false,
    });

    this.progressBar.start(this.totalStep, this.currentStep);
  }

  updatedOneStep() {
    this.currentStep++;
    this.progressBar.update(this.currentStep);
  }

  complete() {
    this.progressBar.stop();
    console.log("completato !!!");
  }
}

module.exports = ProgressBar;
