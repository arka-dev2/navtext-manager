class Message {
  constructor(link, pubblicationDate, type, text, navarea, reference) {
    this.link = link;
    this.pubblicationDate = pubblicationDate;
    this.type = type;
    this.text = text;
    this.navarea = navarea;
    this.reference = reference;
  }
}

module.exports = Message;
