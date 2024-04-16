import * as moment from "moment";

const getStringDateByTime = (t) => {
    return moment(new Date(t)).format("HH:mm DD/MM/YYYY");
};

const formatDateTime = (t) => {
    return moment(new Date(t)).format("HH:mm:ss DD/MM/YYYY");
};

const getStringHourByTime = (t) => {
    return moment(new Date(t)).format("HH:mm:ss");
};

const getStringDate = (t) => {
    return moment(new Date(t)).format("DD/MM/YYYY");
};

export { getStringDateByTime, formatDateTime, getStringHourByTime, getStringDate };
