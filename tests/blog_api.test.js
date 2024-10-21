const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

const initialBlogs = [
    {
        title: 'How to become MLE asap',
        author: 'Jason',
        url: 'twitter.com/jasonwei',
        likes: 99
    },
    {
        title: 'Best qazaq music 2024',
        author: 'Ozen',
        url: 'ozen.com',
        likes: 49
    }
]

describe('when there is some blogs saved', async () => {
    beforeEach(async() => {
        await Blog.deleteMany({})
        let blogObject = new Blog(initialBlogs[0])
        await blogObject.save()
        blogObject = new Blog(initialBlogs[1])
        await blogObject.save()

        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({ username: 'genesis', passwordHash })

        await user.save()
    })

    const loginResponse = await api
        .post('/api/login')
        .send({ username: 'genesis', password: 'secret' })

    const token = loginResponse.body.token    
    
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    
    test('there are two blogs', async () => {
        const response = await api.get('/api/blogs')
      
        assert.strictEqual(response.body.length, 2)
    })
    
    test('blogs has id not _id', async () => {
        const response = await api.get('/api/blogs')
    
        response.body.forEach(blog => {
            assert(blog.id !== undefined)
            assert(blog._id === undefined)
        })
    })
    
    // test('creating a new post is working', async () => {
    //     const newBlog = {
    //         title: 'Qazaqstanda Masele Jeted',
    //         author: 'ZaQ',
    //         url: 'kobelekeffecti.kz/qmj',
    //         likes: 149,
    //     }

    //     console.log(token)
    
    //     await api
    //         .post('/api/blogs')
    //         .send(newBlog)
    //         .set('Authorization', `Bearer ${token}`)
    //         .expect(201)
    //         .expect('Content-Type', /application\/json/)
        
    //     const response = await api.get('/api/blogs')
    //     const titles = response.body.map(blog => blog.title)
    
    //     assert.strictEqual(response.body.length, initialBlogs.length + 1)
    //     assert(titles.includes(newBlog.title))
    // })
    
    // test('if no likes given, it will take default 0 value', async () => {
    //     const newBlog = {
    //         title: 'Qazaqstanda Masele Jeted',
    //         author: 'ZaQ',
    //         url: 'kobelekeffecti.kz/qmj'
    //     }
    
    //     await api 
    //         .post('/api/blogs')
    //         .send(newBlog)
    
    //     const response = await api.get('/api/blogs')
    //     const addedBlog = response.body.find(blog => blog.title === newBlog.title)
    
    //     assert.strictEqual(addedBlog.likes, 0)
    // })
    
    // test('if title is missing responds with 400', async () => {
    //     const newBlog = {
    //         author: 'ZaQ',
    //         url: 'kobelekeffecti.kz/qmj'
    //     }
    
    //     await api
    //         .post('/api/blogs')
    //         .send(newBlog)
    //         .expect(400)
    // })
    
    // test('if url is missing responds with 400', async () => {
    //     const newBlog = {
    //         title: 'Qazaqstanda Masele Jeted',
    //         author: 'ZaQ',
    //     }
    
    //     await api
    //         .post('/api/blogs')
    //         .send(newBlog)
    //         .expect(400)
    // })
    
    test('deleting a single blog post is successful', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const blogToDelete = blogsAtStart.body[0]
        
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
        
        const blogsAtEnd = await api.get('/api/blogs')
        assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length - 1)
    
        const titles = blogsAtEnd.body.map(blog => blog.title)
        assert(!titles.includes(blogToDelete.title))
    })
    
    test('updating a single blog post is successful', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const blogToUpdate = blogsAtStart.body[0]
    
        const updatedBlog = {
            ...blogToUpdate, 
            likes: 20
        }
    
        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedBlog)
            .expect(200)
        
        const blogsAtEnd = await api.get('/api/blogs')
        const retrievedUpdatedBlog = blogsAtEnd.body.find(blog => blog.id === blogToUpdate.id)
        assert.strictEqual(retrievedUpdatedBlog.likes, updatedBlog.likes)
    })
})

describe('when there is initially one user at db', () => {
    describe('username and password validation is working', () => {
        beforeEach(async() => {
            await User.deleteMany({})
    
            const passwordHash = await bcrypt.hash('secret', 10)
            const user = new User({ username: 'genesis', passwordHash })
    
            await user.save()
        })

        test('user is not created if username not given', async () => {
            const usersAtStart = await api.get('/api/users')

            const passwordHash = await bcrypt.hash('secret', 10)
            const newUser = new User({ passwordHash })

            await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
            
            const usersAtEnd = await api.get('/api/users')
            assert.strictEqual(usersAtStart.length, usersAtEnd.length)
        })

        test('user is not created if username is too short', async () => {
            const usersAtStart = await api.get('/api/users')

            const passwordHash = await bcrypt.hash('secret', 10)
            const newUser = new User({ username: 'ro', passwordHash })

            await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
            
            const usersAtEnd = await api.get('/api/users')
            assert.strictEqual(usersAtStart.length, usersAtEnd.length)
        })

        test('user is not created if password not given', async () => {
            const usersAtStart = await api.get('/api/users')

            const newUser = new User({ username: 'root'})

            await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
            
            const usersAtEnd = await api.get('/api/users')
            assert.strictEqual(usersAtStart.length, usersAtEnd.length)
        })

        test('user is not created if password is too short', async () => {
            const usersAtStart = await api.get('/api/users')

            const passwordHash = await bcrypt.hash('se', 10)
            const newUser = new User({ username: 'root', passwordHash})

            await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
            
            const usersAtEnd = await api.get('/api/users')
            assert.strictEqual(usersAtStart.length, usersAtEnd.length)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})