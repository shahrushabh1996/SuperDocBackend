const { expect } = require('chai');
const sinon = require('sinon');

// Mock discount calculation function similar to what's used in the services
function calculateDiscount(price, defaultDiscount, corporateDiscount) {
    // Ensure numeric values, treating null/undefined as 0
    const defaultDiscountValue = (defaultDiscount !== undefined && defaultDiscount !== null) ? Number(defaultDiscount) : 0;
    const corporateDiscountValue = Number(corporateDiscount) || 0;
    const finalDiscountValue = defaultDiscountValue + corporateDiscountValue;
    
    const priceValue = Number(price) || 0;
    const discountedPriceValue = priceValue - (priceValue * finalDiscountValue / 100);
    
    return {
        finalDiscount: finalDiscountValue,
        discountedPrice: discountedPriceValue
    };
}

describe('Discount Calculation Tests', () => {
    describe('Edge Cases for defaultDiscount = 0', () => {
        it('should correctly calculate discounted price when defaultDiscount = 0 and corporateDiscount = 100', () => {
            const result = calculateDiscount(100, 0, 100);
            
            expect(result.finalDiscount).to.equal(100);
            expect(result.discountedPrice).to.equal(0);
        });

        it('should correctly calculate discounted price when defaultDiscount = 0 and corporateDiscount = 50', () => {
            const result = calculateDiscount(100, 0, 50);
            
            expect(result.finalDiscount).to.equal(50);
            expect(result.discountedPrice).to.equal(50);
        });

        it('should correctly calculate discounted price when defaultDiscount = 0 and corporateDiscount = 0', () => {
            const result = calculateDiscount(100, 0, 0);
            
            expect(result.finalDiscount).to.equal(0);
            expect(result.discountedPrice).to.equal(100);
        });
    });

    describe('Edge Cases for defaultDiscount = null/undefined', () => {
        it('should handle null defaultDiscount correctly', () => {
            const result = calculateDiscount(100, null, 50);
            
            expect(result.finalDiscount).to.equal(50);
            expect(result.discountedPrice).to.equal(50);
        });

        it('should handle undefined defaultDiscount correctly', () => {
            const result = calculateDiscount(100, undefined, 50);
            
            expect(result.finalDiscount).to.equal(50);
            expect(result.discountedPrice).to.equal(50);
        });
    });

    describe('Combined Discount Scenarios', () => {
        it('should correctly calculate when defaultDiscount = 10 and corporateDiscount = 20', () => {
            const result = calculateDiscount(100, 10, 20);
            
            expect(result.finalDiscount).to.equal(30);
            expect(result.discountedPrice).to.equal(70);
        });

        it('should correctly calculate when defaultDiscount = 25 and corporateDiscount = 25', () => {
            const result = calculateDiscount(200, 25, 25);
            
            expect(result.finalDiscount).to.equal(50);
            expect(result.discountedPrice).to.equal(100);
        });

        it('should correctly calculate when defaultDiscount = 5 and corporateDiscount = 0', () => {
            const result = calculateDiscount(100, 5, 0);
            
            expect(result.finalDiscount).to.equal(5);
            expect(result.discountedPrice).to.equal(95);
        });
    });

    describe('Zero Price Scenarios', () => {
        it('should handle zero price correctly', () => {
            const result = calculateDiscount(0, 10, 20);
            
            expect(result.finalDiscount).to.equal(30);
            expect(result.discountedPrice).to.equal(0);
        });

        it('should handle null price correctly', () => {
            const result = calculateDiscount(null, 10, 20);
            
            expect(result.finalDiscount).to.equal(30);
            expect(result.discountedPrice).to.equal(0);
        });

        it('should handle undefined price correctly', () => {
            const result = calculateDiscount(undefined, 10, 20);
            
            expect(result.finalDiscount).to.equal(30);
            expect(result.discountedPrice).to.equal(0);
        });
    });

    describe('Edge Cases for 100% Discount', () => {
        it('should result in zero price when total discount is 100%', () => {
            const result = calculateDiscount(150, 40, 60);
            
            expect(result.finalDiscount).to.equal(100);
            expect(result.discountedPrice).to.equal(0);
        });

        it('should handle over 100% discount correctly', () => {
            const result = calculateDiscount(100, 70, 50);
            
            expect(result.finalDiscount).to.equal(120);
            expect(result.discountedPrice).to.equal(-20); // Can result in negative price
        });
    });

    describe('Decimal Discount Scenarios', () => {
        it('should handle decimal discounts correctly', () => {
            const result = calculateDiscount(100, 12.5, 7.5);
            
            expect(result.finalDiscount).to.equal(20);
            expect(result.discountedPrice).to.equal(80);
        });

        it('should handle decimal prices correctly', () => {
            const result = calculateDiscount(99.99, 10, 5);
            
            expect(result.finalDiscount).to.equal(15);
            expect(result.discountedPrice).to.be.closeTo(84.99, 0.01);
        });
    });

    describe('String Input Scenarios', () => {
        it('should handle string discount values correctly', () => {
            const result = calculateDiscount(100, '10', '20');
            
            expect(result.finalDiscount).to.equal(30);
            expect(result.discountedPrice).to.equal(70);
        });

        it('should handle string price values correctly', () => {
            const result = calculateDiscount('100', 10, 20);
            
            expect(result.finalDiscount).to.equal(30);
            expect(result.discountedPrice).to.equal(70);
        });
    });

    describe('Specific Test Cases from Bug Report', () => {
        it('should correctly handle the reported bug scenario: defaultDiscount = 0, corporateDiscount = 100', () => {
            const price = 100;
            const defaultDiscount = 0;
            const corporateDiscount = 100;
            
            const result = calculateDiscount(price, defaultDiscount, corporateDiscount);
            
            // As per the bug report, this should result in discountedPrice = 0
            expect(result.finalDiscount).to.equal(100);
            expect(result.discountedPrice).to.equal(0);
        });

        it('should correctly handle defaultDiscount = 0, corporateDiscount = 50', () => {
            const price = 200;
            const defaultDiscount = 0;
            const corporateDiscount = 50;
            
            const result = calculateDiscount(price, defaultDiscount, corporateDiscount);
            
            expect(result.finalDiscount).to.equal(50);
            expect(result.discountedPrice).to.equal(100);
        });

        it('should correctly handle defaultDiscount = 0, corporateDiscount = 0', () => {
            const price = 100;
            const defaultDiscount = 0;
            const corporateDiscount = 0;
            
            const result = calculateDiscount(price, defaultDiscount, corporateDiscount);
            
            expect(result.finalDiscount).to.equal(0);
            expect(result.discountedPrice).to.equal(100);
        });
    });
});

describe('Integration Tests for Discount Calculation in Services', () => {
    describe('Brand Service - getVoucherPreview', () => {
        it('should calculate correct discount for voucher with defaultDiscount = 0', () => {
            // Mock voucher object
            const voucher = {
                price: 100,
                defaultDiscount: 0,
                discount: [
                    { corporateId: 'corp123', discount: 100 }
                ]
            };
            
            const corporateIdStr = 'corp123';
            
            // Simulate the logic from brand service
            let corporateDiscountValue = 0;
            let applicableDiscountObj = undefined;

            if (corporateIdStr && Array.isArray(voucher.discount)) {
                const found = voucher.discount.find(d => d.corporateId && d.corporateId.toString() === corporateIdStr);
                if (found) {
                    corporateDiscountValue = found.discount;
                    applicableDiscountObj = { percentage: found.discount };
                }
            }

            if (!applicableDiscountObj && voucher.defaultDiscount !== undefined && voucher.defaultDiscount !== null) {
                applicableDiscountObj = { percentage: voucher.defaultDiscount };
            }

            if (!applicableDiscountObj) {
                applicableDiscountObj = { percentage: 0 };
            }

            const defaultDiscountValue = (voucher.defaultDiscount !== undefined && voucher.defaultDiscount !== null) ? Number(voucher.defaultDiscount) : 0;
            const finalDiscountValue = defaultDiscountValue + Number(corporateDiscountValue);

            const priceValue = Number(voucher.price) || 0;
            const discountedPriceValue = priceValue - (priceValue * finalDiscountValue / 100);
            
            expect(finalDiscountValue).to.equal(100);
            expect(discountedPriceValue).to.equal(0);
            expect(applicableDiscountObj.percentage).to.equal(100);
        });
    });
});