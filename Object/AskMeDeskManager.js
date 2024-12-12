const axios = require("axios");

class AskMeDeskManager {
  askMeServer = {
    baseUri: "https://askmedesk.askmesuite.com/Askme",
    username: "archimedemarine",
    password: "!PlimsytheYSS2024!",
    urls: {
      autentication: "/rest/authentication/token",
      requestCreation: "/rest/richieste/creazione-richiesta-ct",
    },
  };

  putMessages(messages) {
    return new Promise((resolve) => {
      this.askMeServerAuth()
        .then((res) => {
          const { sessionId, token } = res.data;
          axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
          axios.defaults.headers.common["Cookie"] = `JSESSIONID=${sessionId}`;
          let url =
            this.askMeServer.baseUri + this.askMeServer.urls.requestCreation;

          for (let messsage of messages) {
            const obj = {
              long: null,
              lat: null,
              description: messsage.description,
              text: messsage.text.replaceAll("\n", "<br>"),
              navarea: messsage.navarea,
            };

            const options = {
              codServizio: "AMPLM",
              codAssetRoot: "SW",
              codAssetFiglio: "SW",
              codTipoRichiesta: "INC",
              codPriorita: "STD",
              oggetto: "uncategorized",
              descrizione: JSON.stringify(obj),
              idUtenteRichiedente: 586, // SVILUPPO 586 - RILASCIO 583
              codiceCanale: "WEB",
              listaSezioniRichiesta: [
                {
                  codice: "IAA",
                  listaAttributiSezione: [
                    {
                      codiceAttributo: "VSL",
                      valoreAttributo: "navtex-alert",
                    },
                    {
                      codiceAttributo: "SWV",
                      valoreAttributo: "1.0.0",
                    },
                  ],
                },
              ],
            };

            this.doAxiosCall("post", url, options)
              .then((res) => {
                console.log("messaggio inserito");
              })
              .catch((e) => {
                if (e.code === "ENOTFOUND") {
                  console.log("errore di connessione al server");
                } else {
                  console.log("errore di autenticazione al server");
                }
              });
          }
        })
        .catch((e) => {
          if (e.code === "ENOTFOUND") {
            console.log("errore di connessione al server");
          } else {
            console.log("errore di autenticazione al server");
          }
        });
    });
  }

  askMeServerAuth() {
    return new Promise((resolve, reject) => {
      const methods = "get";
      const url =
        this.askMeServer.baseUri + this.askMeServer.urls.autentication;
      const options = {
        auth: {
          username: this.askMeServer.username,
          password: this.askMeServer.password,
        },
      };
      this.doAxiosCall(methods, url, options)
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  doAxiosCall(method, url, options) {
    return new Promise((resolve, reject) => {
      axios[method](url, options)
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}

module.exports = new AskMeDeskManager();
