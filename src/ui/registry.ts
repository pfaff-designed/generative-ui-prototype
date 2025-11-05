import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Composed patterns built from Shadcn primitives
import { Hero } from "@/components/blocks/Hero"
import { FeatureGrid } from "@/components/blocks/FeatureGrid"
import { Testimonial } from "@/components/blocks/Testimonial"

export const UI_REGISTRY = {
  // Shadcn primitives
  Button,
  Badge,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  Separator,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Input,
  Label,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Progress,
  Skeleton,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  
  // Composed patterns
  Hero,
  FeatureGrid,
  Testimonial,
} as const

export type UIType = keyof typeof UI_REGISTRY
