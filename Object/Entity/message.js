class Message {
  constructor(
    link,
    publicationDate,
    type,
    description,
    text,
    navarea,
    reference,
    invioLascaux
  ) {
    this.link = link;
    this.publicationDate = publicationDate;
    this.type = type;
    this.description = description;
    this.text = text;
    this.navarea = navarea;
    this.reference = reference;
    this.invioLascaux = invioLascaux;
  }
}

module.exports = Message;
