export const mongodb = {
  data_source: "MONGO_DATA_SOURCE",
  chat: {
    provide: "MONGO_CHAT_REPOSITORY",
  },
  user: {
    provide: "MONGO_USER_REPOSITORY",
  },
};

export const mariadb = {
  data_source: "MARIA_DATA_SOURCE",
  business_label: {
    provide: "MARIA_BUSINESS_LABEL_REPOSITORY",
  },
};

export const pagination = {
  default_page_no_callback: 1,
  default_page_zie: 5,
};
