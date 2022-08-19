export function processGameText(text) {
  const remove = (str,part) => str.split(part).join("");
  let prefix = "";
  let suffix = "";
  if ( text.indexOf("Boys") > -1 ) {
    prefix = "(B) ";
    text = remove(text," Boys");
  }
  if ( text.indexOf("Girls") > -1 ) {
    prefix = "(G) ";
    text = remove(text," Girls");
  }
  if ( text.indexOf("Varsity") > -1 ) {
    suffix = " - V";
    text = remove(text," Varsity");
  }
  if ( text.indexOf("JV") > -1 ) {
    suffix = " - JV";
    text = remove(text," JV");
  }
  if ( text.indexOf("Middle School") > -1 ) {
    suffix = " - MS";
    text = remove(text," Middle School");
  }
  return (prefix + text + suffix).toUpperCase();
}

export function processTeamText(text) {
  const remove = (str,part) => str.split(part).join("");
  let prefix = "";
  let suffix = "";
  if ( text.indexOf("Boys") > -1 ) {
    prefix = "Boys ";
    text = remove(text," Boys");
  }
  if ( text.indexOf("Girls") > -1 ) {
    prefix = "Girls ";
    text = remove(text," Girls");
  }
  if ( text.indexOf("Varsity") > -1 ) {
    suffix = " - Varsity";
    text = remove(text," Varsity");
  }
  if ( text.indexOf("JV") > -1 ) {
    suffix = " - JV";
    text = remove(text," JV");
  }
  if ( text.indexOf("Middle School") > -1 ) {
    suffix = " - MS";
    text = remove(text," Middle School");
  }
  return (prefix + text + suffix).toUpperCase();
}

export function processOpponentText(text) {
  const replacementTable = {
    "Andover": [
      "Phillips Andover",
      "Phillips Andover Academy"
    ],
    "BB&N": [
      "BBN",
      "BBamp;N",
      "Buckingham Browne amp; Nichols School"
    ],
    "Belmont Hill": [
      "Belmont Hill School"
    ],
    "Brooks": [
      "Brooks School"
    ],
    "Dana Hall": [
      "Dana Hall School"
    ],
    "Dexter Southfield": [
      "Dexter Southfield School"
    ],
    "Exeter": [
      "Phillips Exeter",
      "Phillips Exeter Academy"
    ],
    "Fessenden": [
      "The Fessenden School"
    ],
    "Fenn": [
      "The Fenn School"
    ],
    "Governor's": [
      "Governor's Academy"
    ],
    "Groton": [
      "Groton School"
    ],
    "Lawrence": [
      "Lawrence Academy"
    ],
    "Middlesex": [
      "Middlesex School"
    ],
    "Montrose": [
      "Montrose School"
    ],
    "Northfield Mount Hernon": [],
    "Pingree": [
      "Pingree School"
    ],
    "Rivers": [
      "Rivers School"
    ],
    "Roxbury Latin": [
      "Roxbury Latin School",
      "Roxbury Latin Jamboree"
    ],
    "St. George's": [
      "St. George's School"
    ],
    "St. Mark's": [
      "St. Mark's School"
    ],
    "St. Paul's": [
      "St. Paul's School"
    ],
    "St. Sebastian's": [
      "St. Sebastian's School"
    ],
    "Tabor": [
      "Tabor Academy"
    ],
    "Thayer": [
      "Thayer Academy"
    ],
    "Winsor": [
      "The Winsor School"
    ]
  };

  if ( Object.keys(replacementTable).indexOf(text) > -1 ) return text;
  const filtered = Object.entries(replacementTable).filter(item => item[1].indexOf(text) > -1);
  if ( filtered.length > 0 ) return filtered[0][0];
  if ( text.indexOf("Championship") > -1 || text.indexOf("Invitational") > -1 ) return "Championship";
  return text;
};

export const schoolLogos = {
  "Andover": require("../assets/images/schoollogos/Andover.png"),
  "BB&N": require("../assets/images/schoollogos/BBN.png"),
  "Belmont Hill": require("../assets/images/schoollogos/Belmont_Hill.png"),
  "Brooks": require("../assets/images/schoollogos/Brooks.png"),
  "Dana Hall": require("../assets/images/schoollogos/Dana_Hall.png"),
  "Dexter Southfield": require("../assets/images/schoollogos/Dexter_Southfield.png"),
  "Exeter": require("../assets/images/schoollogos/Exeter.png"),
  "Fessenden": require("../assets/images/schoollogos/Fessenden.png"),
  "Fenn": require("../assets/images/schoollogos/Fenn.png"),
  "Governor's": require("../assets/images/schoollogos/Governors.png"),
  "Groton": require("../assets/images/schoollogos/Groton.png"),
  "Lawrence": require("../assets/images/schoollogos/Lawrence.png"),
  "Middlesex": require("../assets/images/schoollogos/Middlesex.png"),
  "Montrose": require("../assets/images/schoollogos/Montrose.png"),
  "Northfield Mount Hernon": require("../assets/images/schoollogos/Northfield_Mount_Hernon.png"),
  "Pingree": require("../assets/images/schoollogos/Pingree.png"),
  "Rivers": require("../assets/images/schoollogos/Rivers.png"),
  "Roxbury Latin": require("../assets/images/schoollogos/Roxbury_Latin.png"),
  "St. George's": require("../assets/images/schoollogos/St_Georges.png"),
  "St. Paul's": require("../assets/images/schoollogos/St_Pauls.png"),
  "St. Sebastian's": require("../assets/images/schoollogos/St_Sebastians.png"),
  "Tabor": require("../assets/images/schoollogos/Tabor.png"),
  "Thayer": require("../assets/images/schoollogos/Thayer.png"),
  "Winsor": require("../assets/images/schoollogos/Winsor.png"),
  "Championship": require("../assets/images/schoollogos/Championship.png"),
  "None": require("../assets/images/schoollogos/None.png")
};