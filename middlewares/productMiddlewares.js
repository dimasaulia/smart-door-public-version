const { PrismaClient } = require("@prisma/client");
const { resError } = require("../services/error");
const { getUser } = require("../services/jwt");
const prisma = new PrismaClient();

const isExist = async (req, res, next) => {
    const productId = req.params.id;
    try {
        const product = await prisma.product.findUnique({
            where: {
                id: Number(productId),
            },
        });
        if (!product) throw "Product not exist";
        return next();
    } catch (error) {
        return resError({
            res,
            title: "Cant find product",
            errors: error,
        });
    }
};

const isUserProduct = async (req, res, next) => {
    const productId = req.params.id;
    const userId = getUser(req);
    try {
        const product = await prisma.product.findUnique({
            where: {
                id: Number(productId),
            },
            select: {
                userId: true,
            },
        });
        // console.log(product, userId, product !== userId);
        if (product.userId !== userId) throw "This is not your product";
        return next();
    } catch (error) {
        return resError({
            res,
            title: "You can't perform this action",
            errors: error,
        });
    }
};

module.exports = { isExist, isUserProduct };
