class Message {
  constructor(
    link,
    pubblicationDate,
    type,
    description,
    text,
    navarea,
    reference
  ) {
    this.link = link;
    this.pubblicationDate = pubblicationDate;
    this.type = type;
    this.description = description;
    this.text = text;
    this.navarea = navarea;
    this.reference = reference;
  }
}

module.exports = Message;
