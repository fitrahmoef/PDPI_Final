import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, canAccessBranch } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateNPA } from '@/lib/utils'
import { z } from 'zod'

// Validation schema for member data
const memberSchema = z.object({
  gelarDepan: z.string().optional(),
  namaLengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  gelarBelakang: z.string().optional(),
  jenisKelamin: z.enum(['L', 'P']),
  tempatLahir: z.string().min(1, 'Tempat lahir wajib diisi'),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  agama: z.string().optional(),
  statusPerkawinan: z.string().optional(),
  alamatRumah: z.string().min(1, 'Alamat rumah wajib diisi'),
  kota: z.string().min(1, 'Kota wajib diisi'),
  provinsi: z.string().min(1, 'Provinsi wajib diisi'),
  nomorHP: z.string().min(10, 'Nomor HP tidak valid'),
  email: z.string().email('Email tidak valid'),
  nik: z.string().optional(),
  npwp: z.string().optional(),
  alumni: z.string().min(1, 'Alumni wajib diisi'),
  bulanTahunLulus: z.string().min(1, 'Bulan tahun lulus wajib diisi'),
  statusAnggota: z.enum(['BIASA', 'MUDA', 'LUAR_BIASA']),
  cabang: z.string().min(1, 'Cabang wajib diisi'),
  tempatPraktik: z.array(z.object({
    namaRS: z.string().min(1, 'Nama RS/Klinik wajib diisi'),
    kota: z.string().min(1, 'Kota wajib diisi'),
    provinsi: z.string().min(1, 'Provinsi wajib diisi')
  })).optional()
})

// GET - Fetch members with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const cabang = searchParams.get('cabang') || ''
    const jenisKelamin = searchParams.get('jenisKelamin') || ''

    // Build where clause based on user role and filters
    const where: any = {}

    // Role-based filtering
    if (session.user.role === 'BRANCH_ADMIN' && session.user.branch) {
      where.cabang = session.user.branch
    } else if (cabang && session.user.role === 'CENTRAL_ADMIN') {
      where.cabang = cabang
    }

    // Search filtering
    if (search) {
      where.OR = [
        { npa: { contains: search, mode: 'insensitive' } },
        { namaLengkap: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Status filtering
    if (status) {
      where.statusKeanggotaan = status
    }

    // Gender filtering
    if (jenisKelamin) {
      where.jenisKelamin = jenisKelamin
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        include: {
          tempatPraktik: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.member.count({ where })
    ])

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('GET /api/members error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create members
    if (!['CENTRAL_ADMIN', 'BRANCH_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate input data
    const validatedData = memberSchema.parse(body)

    // Check if branch admin is trying to create member for their branch only
    if (session.user.role === 'BRANCH_ADMIN') {
      if (validatedData.cabang !== session.user.branch) {
        return NextResponse.json(
          { error: 'You can only create members for your branch' },
          { status: 403 }
        )
      }
    }

    // Check if email already exists
    const existingMember = await prisma.member.findFirst({
      where: { email: validatedData.email }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Generate unique NPA
    let npa: string
    let npaExists = true
    
    while (npaExists) {
      npa = generateNPA()
      const existing = await prisma.member.findUnique({
        where: { npa }
      })
      npaExists = !!existing
    }

    // Create member
    const member = await prisma.member.create({
      data: {
        npa: npa!,
        gelarDepan: validatedData.gelarDepan,
        namaLengkap: validatedData.namaLengkap,
        gelarBelakang: validatedData.gelarBelakang,
        jenisKelamin: validatedData.jenisKelamin,
        tempatLahir: validatedData.tempatLahir,
        tanggalLahir: new Date(validatedData.tanggalLahir),
        agama: validatedData.agama,
        statusPerkawinan: validatedData.statusPerkawinan,
        alamatRumah: validatedData.alamatRumah,
        kota: validatedData.kota,
        provinsi: validatedData.provinsi,
        nomorHP: validatedData.nomorHP,
        email: validatedData.email,
        nik: validatedData.nik,
        npwp: validatedData.npwp,
        alumni: validatedData.alumni,
        bulanTahunLulus: validatedData.bulanTahunLulus,
        statusAnggota: validatedData.statusAnggota,
        cabang: validatedData.cabang,
        branchAdminId: session.user.role === 'BRANCH_ADMIN' ? session.user.id : undefined,
        tempatPraktik: validatedData.tempatPraktik ? {
          create: validatedData.tempatPraktik
        } : undefined
      },
      include: {
        tempatPraktik: true
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_MEMBER',
        description: `Created new member: ${member.namaLengkap} (${member.npa})`
      }
    })

    return NextResponse.json({ member }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('POST /api/members error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update member
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id')

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Get existing member
    const existingMember = await prisma.member.findUnique({
      where: { id: memberId }
    })

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (session.user.role === 'BRANCH_ADMIN') {
      if (!canAccessBranch(session.user.role, session.user.branch, existingMember.cabang)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const body = await request.json()
    const validatedData = memberSchema.partial().parse(body)

    // Update member
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        ...validatedData,
        tanggalLahir: validatedData.tanggalLahir ? new Date(validatedData.tanggalLahir) : undefined,
        updatedAt: new Date()
      },
      include: {
        tempatPraktik: true
      }
    })

    // Update tempat praktik if provided
    if (validatedData.tempatPraktik) {
      // Delete existing tempat praktik
      await prisma.tempatPraktik.deleteMany({
        where: { memberId }
      })

      // Create new tempat praktik
      if (validatedData.tempatPraktik.length > 0) {
        await prisma.tempatPraktik.createMany({
          data: validatedData.tempatPraktik.map(tp => ({
            ...tp,
            memberId
          }))
        })
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_MEMBER',
        description: `Updated member: ${updatedMember.namaLengkap} (${updatedMember.npa})`
      }
    })

    return NextResponse.json({ member: updatedMember })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('PUT /api/members error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete member
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete members
    if (!['CENTRAL_ADMIN', 'BRANCH_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id')

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Get existing member
    const existingMember = await prisma.member.findUnique({
      where: { id: memberId }
    })

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (session.user.role === 'BRANCH_ADMIN') {
      if (!canAccessBranch(session.user.role, session.user.branch, existingMember.cabang)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Delete member (cascade will handle tempat praktik)
    await prisma.member.delete({
      where: { id: memberId }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_MEMBER',
        description: `Deleted member: ${existingMember.namaLengkap} (${existingMember.npa})`
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('DELETE /api/members error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}