import axios from 'axios'
import _ from 'lodash'
import Footer from '../../components/Footer'
import Header from '../../components/Header'
import PostCard from '../../components/PostCard'
import helpers from '../../helpers'
import config from '../../config'
import React from 'react'
import Head from 'next/head'

function AuthorPage({ cosmic }) {
  if (!cosmic)
    return <div>Loading...</div>
  return (
    <div>
      <Head>
        <title key="sitetitle">Author Posts</title>
      </Head>
      <Header cosmic={ cosmic }/>
      <main className="container">
        {
          !cosmic.posts &&
          'You must add at least one Post to your Bucket'
        }
        {
          cosmic.posts &&
          cosmic.posts.map(post => {
            
            const friendly_date = helpers.friendlyDate(new Date(post.created_at))
            post.friendly_date = friendly_date.month + ' ' + friendly_date.date
        
            return <div key={post.id}><PostCard post={post} /></div>
          })
        }
      </main>
      <Footer />
    </div>
  )
}
// Get Global and Posts data
export async function getStaticProps({ params }) {
  const query = `{
    getObjects(
      bucket_slug: "${config.bucket.slug}",
      read_key: "${config.bucket.read_key}"
    )
    {
      objects {
        id
        type
        slug
        title
        metadata
        created_at
      }
    }
  }`
  return await axios.post(`https://graphql.cosmicjs.com/v3`, { query })
  .then(function (response) {
    const posts = _.filter(response.data.data.getObjects.objects, (post) => { return post.metadata && post.metadata.author && post.metadata.author.slug === params.slug });
    return {
      props: {
        cosmic: {
          posts,
          global: _.keyBy(_.filter(response.data.data.getObjects.objects, { type: 'globals' }), 'slug')
        }
      }
    }
  })
  .catch(function (error) {
    return console.log(error)
  })
}

 // Get All Possible Slugs
export async function getAllDataWithSlug() {
  const posts_query = `{
     getObjects(
       bucket_slug: "${config.bucket.slug}",
       read_key: "${config.bucket.read_key}"
       input: {
         query: {
           type: "posts"
         }
         props: "slug"
       }
     ) {
        objects {
         slug
       }
     }
   }`
   let posts = await axios.post(`https://graphql.cosmicjs.com/v3`, { query: posts_query })
   .then(function (response) {    
     return response.data.data.getObjects.objects
   })
   .catch(function (error) {
     console.log(error)
   })
   return posts
 }

 // Get All Static Paths
 export async function getStaticPaths() {
  const dataWithSlug = (await getAllDataWithSlug()) || [];
  return {
    paths: dataWithSlug.map((post) => `/author/${post.slug}`),
    fallback: true,
  }
}

export default AuthorPage