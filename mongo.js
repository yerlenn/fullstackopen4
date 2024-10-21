const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://yrlnsayfulla:${password}@cluster0.rfbsi.mongodb.net/blogApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)

if (process.argv.length===7) {
    const blogTitle = process.argv[3]
    const blogAuthor = process.argv[4]
    const blogUrl = process.argv[5]
    const blogLikes = process.argv[6]

    const blog = new Blog({
        title: blogTitle,
        author: blogAuthor, 
        url: blogUrl,
        likes: blogLikes
    })
    blog.save().then(result => {
        console.log(`Added ${blogTitle} author ${blogAuthor} to blog list`)
        mongoose.connection.close()
    })
}

if (process.argv.length===3) {
    console.log('blog list:')
    Blog.find({}).then(result => {
        result.forEach(blog => {
            console.log(blog.title, blog.author, blog.url, blog.likes)
        })
        mongoose.connection.close()
    })
}
// const note = new Note({
//   content: 'Mongoose make things easy',
//   important: true,
// })

// note.save().then(result => {
//   console.log('note saved!')
//   mongoose.connection.close()
// })

// Note.find({}).then(result => {
//     result.forEach(note => {
//         console.log(note)
//     })
//     mongoose.connection.close()
// })