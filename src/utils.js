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