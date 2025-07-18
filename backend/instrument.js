
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://8ce71b849b0d16de52bb28f94a241f3e@o4509668567482368.ingest.de.sentry.io/4509668569841744",


  sendDefaultPii: true,
});
