import { Button } from 'nr1';

export const splitPageUrl = ({ pageUrl }) => {
  // break the url up into separate piece so we can style them differently
  const protocol = pageUrl
    ? `${pageUrl
        .split('/')
        .filter((piece, i) => i < 2 && piece)
        .toString()}//`
    : null;
  const domain = pageUrl
    ? pageUrl
        .split('/')
        .filter((piece, i) => i === 2 && piece)
        .join('/')
    : null;
  let path = pageUrl
    ? pageUrl
        .split('/')
        .filter((piece, i) => i > 2 && piece)
        .join('/')
    : null;
  path = `/${path}`;

  return { protocol, domain, path };
};

export const getIconType = function(apm) {
  if (apm.alertSeverity === 'NOT_ALERTING') {
    return Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__SERVICE__S_OK;
  } else if (apm.alertSeverity === 'WARNING') {
    return Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__SERVICE__S_WARNING;
  } else if (apm.alertSeverity === 'CRITICAL') {
    return Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__SERVICE__S_ERROR;
  } else {
    return Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__SERVICE;
  }
};
