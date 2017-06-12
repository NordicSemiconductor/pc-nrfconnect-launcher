import React from 'react';
import PropTypes from 'prop-types';
import logo from '../../resources/nordiclogo_neg.png';
import { openUrlInDefaultBrowser } from '../util/fileUtil';

const Logo = ({
    src,
    alt,
    cssClass,
    containerCssClass,
    onClick,
}) => (
    <div
        className={containerCssClass}
        role="link"
        onClick={onClick}
        tabIndex="0"
    >
        <img className={cssClass} src={src} alt={alt} />
    </div>
);

Logo.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    cssClass: PropTypes.string,
    containerCssClass: PropTypes.string,
    onClick: PropTypes.function,
};

Logo.defaultProps = {
    src: logo,
    alt: 'nRF Connect',
    cssClass: 'core-logo',
    containerCssClass: 'core-logo-container',
    onClick: openUrlInDefaultBrowser.bind(null, 'http://www.nordicsemi.com/nRFConnect'),
};

export default Logo;
