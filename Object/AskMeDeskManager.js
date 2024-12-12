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
      askMeServerAuth()
        .then((res) => {
          const { sessionId, token } = res.data;
          axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
          axios.defaults.headers.common["Cookie"] = `JSESSIONID=${sessionId}`;

          let url = askMeServer.baseUri + askMeServer.urls.requestCreation;

          options = {
            codServizio: "AMPLM",
            codAssetRoot,
            codAssetFiglio: codAssetRoot,
            codTipoRichiesta,
            codPriorita: "STD",
            oggetto: object,
            descrizione: description,
            idUtenteRichiedente: 586, // SVILUPPO 586 - RILASCIO 583
            codiceCanale: "WEB",
            listaSezioniRichiesta: [
              {
                codice: "IAA",
                listaAttributiSezione: [
                  {
                    codiceAttributo: "VSL",
                    valoreAttributo: generalInformation["SHIP NAME"],
                  },
                  {
                    codiceAttributo: "SWV",
                    valoreAttributo: version,
                  },
                ],
              },
            ],
          };

          doAxiosCall(method, url, options)
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
      const url = askMeServer.baseUri + askMeServer.urls.autentication;
      const options = {
        auth: {
          username: askMeServer.username,
          password: askMeServer.password,
        },
      };
      doAxiosCall(methods, url, options)
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
