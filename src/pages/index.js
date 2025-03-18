"use-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import Image from "next/image"
import Link from "next/link"
import axios from "axios"
import Cookies from 'js-cookie';
import { useRouter } from "next/router"
import { useEffect, useState } from "react"


export default function Home() {
  const [test, setTest] = useState([])
  const token = Cookies.get('token');
  const router = useRouter()

  const fetchTest = async()=>{
    try{
      const response = await axios.get(`/api/test/getTest`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      setTest(response.data.data)
    }
    catch(err){
      console.log(err)
    }
  }

  useEffect(()=>{
    fetchTest();
  },[])

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header with Logo */}
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex justify-center md:justify-start">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="MockPrep Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-bold">Lets Test</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Tests</h1>
          <p className="text-muted-foreground mt-2">Browse and take mock tests to prepare for your exams</p>
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {test.map((test,i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <CardTitle>{test.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground">{test.description}</p>
                <div className="flex gap-4 mt-4">
                  <div className="text-sm">
                    <span className="font-medium">Duration:</span> {test.duration}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Questions:</span> {test.questions.length}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {!test.isActive ? 
                <Button className="w-full cursor-pointer" onClick={()=>{router.push(`/result/${test._id}`)}}>Result</Button>
                :
                <Button className="w-full cursor-pointer" onClick={()=>{router.push(`/test/${test._id}`)}}>Start Test</Button>
                }
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </main>
  )
}

