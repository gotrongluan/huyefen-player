import _ from 'lodash';

export const secondsToTime = __time => {
    const hours = _.floor(__time / 3600);
    const time = __time - hours * 3600;
    const minutes = _.floor(time / 60);
    const seconds = _.toInteger(time - minutes * 60);
    const padTime = val => val < 10 ? `0${val}` : val;
    if (hours > 0) return `${padTime(hours)}:${padTime(minutes)}:${padTime(seconds)}`;
    return `${padTime(minutes)}:${padTime(seconds)}`;
};

export const checkValidLink = link => {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(link);
};