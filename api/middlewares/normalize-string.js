exports.normalizeString = (str) => {
    return str.replace(/['"]/g, "");
};

exports.normalizeInt = (str) => {
    return str.replace(/[^0-9]/g, "");
};

exports.normalizeFloat = (str) => {
    let flag = 0; // so dau cham

    str = str.replace(/[^0-9.]/g, "");

    for (let i = 0; i < str.length; i++) {
        if (str[i] === ".") {
            flag++;
        }
        if (flag > 1) {
            str = str.replace(str[i], "");
            i--;
            flag--;
        }
    }

    return str;
};
