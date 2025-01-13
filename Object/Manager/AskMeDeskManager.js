const reportManager = require("./ReportManager.js");
const axios = require("axios");

class AskMeDeskManager {
  askMeServer = {
    baseUri: "https://askmedesk.askmesuite.com/Askme",
    username: "archimedemarine",
    password: "!PlimsytheYSS2024!",
    urls: {
      autentication: "/rest/authentication/token",
      requestCreation: "/rest/richieste/creazione-richiesta-ct",
      requestList: "/rest/richieste",
      requestDelete: "/rest/richieste/cancellazione-massiva",
    },
  };

  putMessages(messages, callback) {
    return new Promise((resolve) => {
      this.askMeServerAuth()
        .then((res) => {
          let url = this.askMeServer.baseUri + this.askMeServer.urls.requestCreation;

          for (let message of messages) {
            if (!message.invioLascaux) {
              const report = reportManager.getReportFromMessage(message);
              const obj = {
                areaType: report.areaType,
                coordinates: report.coordinates,
                navtext: report.navtext,
              };

              const options = {
                codServizio: "AMPLM",
                codAssetRoot: "SW",
                codAssetFiglio: "SW",
                codTipoRichiesta: "INC",
                codPriorita: "STD",
                oggetto: report.messageType,
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
                  callback();
                })
                .catch((e) => {
                  console.log(e);
                });
            }
          }
        })
        .catch((e) => {
          console.log(e);
        });
    });
  }

  getMessage() {
    return new Promise((resolve) => {
      this.askMeServerAuth()
        .then((res) => {
          let url = this.askMeServer.baseUri + this.askMeServer.urls.requestList;
          let options = {
            params: {
              listaIdTipoRichiesta: 2, // TIPO INC 2 - TIPO GEN 3
              idUtenteCre: 586, // SVILUPPO 586 - RILASCIO 583
              statoRichiesta: "A", //SOLO PER CONTROLLO RIMOZIONE CORRETTA ELEMENTI
              stato: "A",
            },
          };

          this.doAxiosCall("get", url, options)
            .then((res) => {
              const list = res.data.data;
              const signalsObj = {};
              if (list.length) {
                list.forEach((el) => {
                  if (el.oggetto === "XXXXXX") return;
                  const position = JSON.parse(el.descrizione);
                  const id = el.idRichiesta;
                  const dateMs = new Date(el.dataRichiesta);
                  const date = this.getDate(dateMs);
                  const time = this.getTime(dateMs);
                  signalsObj[id] = {
                    type: el.oggetto,
                    latitude: position.lat,
                    longitude: position.long,
                    date,
                    time,
                  };
                });
              }
              resolve({ message: signalsObj });
            })
            .catch((e) => {
              console.log(e);
            });
        })
        .catch((e) => {
          console.log(e);
        });
    });
  }

  delateMessages(idRichieste) {
    return new Promise((resolve) => {
      this.askMeServerAuth()
        .then((res) => {
          const { sessionId, token } = res.data;
          axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
          axios.defaults.headers.common["Cookie"] = `JSESSIONID=${sessionId}`;
          let url = this.askMeServer.baseUri + this.askMeServer.urls.requestDelete;
          let options = {
            idRichieste: idRichieste,
            note: "",
          };
          this.doAxiosCall("post", url, options)
            .then((res) => {
              console.log("messaggi eliminati");
            })
            .catch((e) => {
              if (e.code === "ENOTFOUND") {
                console.log("errore di connessione al server");
              } else {
                console.log(e);
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

  getDate(date) {
    const day = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth(+1)}` : `${date.getMonth() + 1}`;
    return `${day}/${month}/${date.getFullYear()}`;
  }

  getTime(date) {
    let hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    const desc = date.getHours() >= 12 ? "PM" : "AM";
    hours = hours < 10 ? `0${hours}` : `${hours}`;
    const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : `${date.getMinutes()}`;
    return `${hours}:${minutes} ${desc}`;
  }

  askMeServerAuth() {
    return new Promise((resolve, reject) => {
      const methods = "get";
      const url = this.askMeServer.baseUri + this.askMeServer.urls.autentication;
      this.doAxiosCall(methods, url, {})
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          if (e.status === 401) {
            const options = {
              auth: {
                username: this.askMeServer.username,
                password: this.askMeServer.password,
              },
            };
            this.doAxiosCall(methods, url, options)
              .then((res) => {
                const { sessionId, token } = res.data;
                axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
                axios.defaults.headers.common["Cookie"] = `JSESSIONID=${sessionId}`;
                resolve(res);
              })
              .catch((e) => {
                reject(e);
              });
          } else reject(e);
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
