export const teams = [
  {
    slug: "aztecas",
    name: "Aztecas",
    image: "/img/team/aztecas.jpg",
    imageAlt: "/img/team/aztecas_championship.jpeg",
    manager: null,
  },
  {
    slug: "bullies",
    name: "Bullies",
    image: "/img/team/bullies.jpg",
    imageAlt: null,
  },
  {
    slug: "hot_shotz",
    name: "Hot Shotz",
    image: "/img/team/hot_shotz_summer26.jpeg",
    imageAlt: "/img/team/hot_shotz.jpeg",
  },
  {
    slug: "sandlot",
    name: "Sandlot",
    image: "/img/team/sandlot.jpg",
    imageAlt: null,
  },
  {
    slug: "arabes",
    name: "Arabes",
    image: "/img/team/arabes_summer_26.jpeg",
    imageAlt: null,
    manager: "Victor Benitez",
    managerUrl: "https://www.facebook.com/vabenitez10",
  },
  {
    slug: "outlaws",
    name: "Outlaws",
    image: "/img/team/wolves.jpg",
    imageAlt: null,
  },
  {
    slug: "los_gringos",
    name: "Los Gringos",
    image: "/img/team/gringos_summer26.jpeg",
    imageAlt: null,
  },
];

export function getTeamBySlug(slug) {
  return teams.find(t => t.slug === slug);
}
export function getTeamByName(name) {
  return teams.find(t => t.name === name);
}

export const locationMeta = {
  "Stark Field": { id: "stark", name: "Stark Field", address: "830 S 4th St, El Centro, CA 92243" },
  "Stark": { id: "stark", name: "Stark Field", address: "830 S 4th St, El Centro, CA 92243" },
  "Sunflower": { id: "sunflower", name: "Sunflower Park", address: "Sunflower Park Baseball Field, El Centro" },
  "Calexico": { id: "calexico", name: "Calexico High School", address: "1030 Encinas Ave, Calexico, CA 92231" },
  "Central": { id: "central", name: "Central Union HS", address: "1001 W Brighton Ave, El Centro, CA 92243" },
  "Brawley": { id: "brawley", name: "Wiest Field", address: "1044 Magnolia St, Brawley, CA 92227" },
  "Holtville": { id: "stark", name: "Holtville (Stark)", address: "Holtville, CA" },
};

export const locationMaps = {
  stark: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3217.638470076104!2d-115.55374035672413!3d32.784888862084905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d767275950629f%3A0xb001fbf6e37df90e!2sStark%20Field!5e0!3m2!1sen!2sus!4v1763238175338!5m2!1sen!2sus",
  sunflower: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6678.072121466914!2d-115.59034616700757!3d32.79790800165874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d760c747c8ee75%3A0x9e6d771ae403ef78!2sSunflower%20Park%20Baseball%20Field!5e0!3m2!1sen!2sus!4v1764185584308!5m2!1sen!2sus",
  calexico: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4524.41559785635!2d-115.48748588178826!3d32.67804817900981!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d7654e6bb50c65%3A0x7a921d8b1ade9b1a!2sCalexico%20High%20School!5e0!3m2!1sen!2sus!4v1750026996983!5m2!1sen!2sus",
  central: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1864.8797822462923!2d-115.56714614837294!3d32.78929759104018!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d761f5fd1f0b4d%3A0x9846a323b6e99999!2sCentral%20Union%20High%20School%20Baseball%20Field!5e0!3m2!1sen!2sus!4v1750027162567!5m2!1sen!2sus",
  brawley: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3346.6757781600422!2d-115.54052122407579!3d32.985954773278436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d75a6e094a6237%3A0xfd436d7dee5b63fc!2sWiest%20Field!5e0!3m2!1sen!2sus!4v1782156714773!5m2!1sen!2sus",
};
