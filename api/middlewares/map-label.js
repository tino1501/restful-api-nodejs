exports.mapToSexLabel = (id) => {
    if (id === 0) return "Nam";
    else if (id === 1) return "Nữ";
    else return "Khác";
};

exports.mapToTableStatusLabel = (id) => {
    if (id == 0) {
        return "Trống";
    } else if (id == 1) return "Đã đặt";
};

// exports.mapToBillStatusLabel = (id) => {
//     if (id == 0) {
//         return "Chưa thanh toán";
//     } else if (id == 1) return "Đã thanh toán";
// }
