class Message {
  constructor(link, pubblicationDate, type, text, navarea) {
    this.link = link;
    this.pubblicationDate = pubblicationDate;
    this.type = type;
    this.text = text;
    this.navarea = navarea;
  }
}

module.exports = Message;
