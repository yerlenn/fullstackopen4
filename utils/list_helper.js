const dummy = (array) => {
    return 1
}

const totalLikes = (array) => {
    const reducer = (sum, item) => {
        return sum + item.likes
    }

    return array.reduce(reducer, 0)
}

const favouriteBlog = (array) => {
    var maxLikes = 0
    var result = {}
    if (array.length > 0) {
        array.map(item => {
            if (item.likes > maxLikes) {
                maxLikes = item.likes
                result = item
            }
        })
    }
    
    return result
}

module.exports = {
    dummy, totalLikes, favouriteBlog
}